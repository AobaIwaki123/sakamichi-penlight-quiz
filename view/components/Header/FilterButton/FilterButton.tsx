"use client";

import { hinatazakaFilters } from '@/consts/hinatazakaFilters';
import { ActionIcon, Checkbox, Menu, Stack } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import { IconFilter, IconFilterFilled } from '@tabler/icons-react';
import { useEffect, useState } from "react";

export function FilterButton() {
  const [isOpened, setIsOpened] = useState(false);
  const ref = useClickOutside(() => setIsOpened(false));

  // チェック状態をStateで管理
  const [checkedFilters, setCheckedFilters] = useState(
    () => hinatazakaFilters.reduce((acc, filter) => {
      acc[filter.type] = filter.defaultChecked || false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const handleCheckboxChange = (type: string, checked: boolean) => {
    setCheckedFilters((prev) => ({
      ...prev,
      [type]: checked,
    }));
    console.log(`${type} is ${checked ? 'checked' : 'unchecked'}`);
  };

  const selected = Object.entries(checkedFilters)
    .filter(([, checked]) => checked)
    .map(([type]) => type);
    
  useEffect(() => {
    console.log("選択中のフィルター:", selected);
  }, [selected]);

  return (
    <Menu closeOnClickOutside={true} closeOnItemClick={false}>
      <Menu.Target>
        <ActionIcon
          onClick={() => setIsOpened((prev) => !prev)}
          variant="subtle"
          size="xl"
        >
          {isOpened ? <IconFilterFilled stroke={1.5} /> : <IconFilter stroke={1.5} />}
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>フィルター</Menu.Label>
        <Menu.Item>
          <Stack>
            {hinatazakaFilters.map((filter) => (
              <Checkbox
                key={filter.type}
                label={filter.type}
                checked={checkedFilters[filter.type]}
                onChange={(event) =>
                  handleCheckboxChange(filter.type, event.currentTarget.checked)
                }
              />
            ))}
          </Stack>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
