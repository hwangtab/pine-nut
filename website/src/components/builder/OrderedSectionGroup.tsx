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

  const orderedChildren = useMemo(() => {
    const childArray = Children.toArray(children).filter(isSectionChild);
    const childMap = new Map<string, ReactNode>();

    childArray.forEach((child) => {
      const sectionId =
        typeof child.props.sectionId === "string" ? child.props.sectionId : null;

      if (sectionId) {
        childMap.set(sectionId, child);
      }
    });

    return sectionOrder
      .map((sectionId) => childMap.get(sectionId))
      .filter((child): child is ReactNode => child !== undefined);
  }, [children, sectionOrder]);

  return <>{orderedChildren}</>;
}
