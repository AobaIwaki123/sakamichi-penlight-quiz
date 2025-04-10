"use client";

import { hinatazakaFilters } from '@/consts/hinatazakaFilters';
import { ActionIcon, Checkbox, Menu, Stack } from '@mantine/core';
import { IconFilter, IconFilterFilled } from '@tabler/icons-react';
import { useEffect, useState } from "react";
import { useFilterStore } from '@/stores/useFilterStore';

export function FilterButton() {
  const [isOpened, setIsOpened] = useState(false);
  const setFilter = useFilterStore((state) => state.setFilter);

  // チェック状態をStateで管理
  const checkedFilters = useFilterStore((state) => state.checkedFilters);
  const handleCheckboxChange = (type: string, checked: boolean) => {
    setFilter(type, checked);
    console.log(`${type} is ${checked ? 'checked' : 'unchecked'}`);
  };

  useEffect(() => {
    for (const filter of hinatazakaFilters) {
      useFilterStore.getState().setFilter(filter.type, filter.defaultChecked || false);
    }
  }, []);

  useEffect(() => {
    const selected = Object.entries(checkedFilters)
      .filter(([, checked]) => checked)
      .map(([type]) => type);
    console.log("選択中のフィルター:", selected);
  }, [checkedFilters]);

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
