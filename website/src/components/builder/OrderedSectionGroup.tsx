"use client";

import { Children, isValidElement, useMemo, type ReactElement, type ReactNode } from "react";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { parseExistingSectionOrder } from "@/lib/custom-sections";

interface SectionChildProps {
  sectionId?: string;
}

interface OrderedSectionGroupProps {
  page: string;
  defaultOrder: string[];
  children: ReactNode;
}

function isSectionChild(
  child: ReactNode,
): child is ReactElement<SectionChildProps> {
  return isValidElement(child);
}

export default function OrderedSectionGroup({
  page,
  defaultOrder,
  children,
}: OrderedSectionGroupProps) {
  const { getContent } = useAdminEdit();
  const sectionOrder = parseExistingSectionOrder(
    getContent(`builder.${page}.sectionOrder`),
    defaultOrder,
  );

  const { orderedChildren, passthrough } = useMemo(() => {
    const childArray = Children.toArray(children).filter(isSectionChild);
    const childMap = new Map<string, ReactNode>();
    // sectionId가 없는 자식(토스트·편집 컨트롤 등)은 정렬 대상이 아닐 뿐,
    // 버려야 할 대상이 아니다. 예전에는 통째로 사라져 영영 렌더되지 않았다.
    const extras: ReactNode[] = [];

    childArray.forEach((child) => {
      const sectionId =
        typeof child.props.sectionId === "string" ? child.props.sectionId : null;

      if (sectionId) {
        childMap.set(sectionId, child);
      } else {
        extras.push(child);
      }
    });

    return {
      orderedChildren: sectionOrder
        .map((sectionId) => childMap.get(sectionId))
        .filter((child): child is ReactNode => child !== undefined),
      passthrough: extras,
    };
  }, [children, sectionOrder]);

  return (
    <>
      {orderedChildren}
      {passthrough}
    </>
  );
}
