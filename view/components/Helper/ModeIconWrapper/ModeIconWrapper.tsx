import { useMantineColorScheme } from "@mantine/core";
import type { ComponentProps, ElementType } from "react";
import { useEffect, useState } from "react";

interface IconProps extends ComponentProps<any> {
  icon: ElementType;
  lightColor?: string;
  darkColor?: string;
}

export function ModeIconWrapper({
  icon: Icon,
  lightColor = "gray",
  darkColor = "gray",
  ...props
}: IconProps) {
  const { colorScheme } = useMantineColorScheme();
  const [iconColor, setIconColor] = useState(lightColor);

  useEffect(() => {
    setIconColor(colorScheme === "dark" ? darkColor : lightColor);
  }, [colorScheme, lightColor, darkColor]);

  return <Icon color={iconColor} {...props} />;
}
