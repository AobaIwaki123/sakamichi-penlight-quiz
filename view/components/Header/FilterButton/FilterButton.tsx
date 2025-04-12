"use client";

import { hinatazakaFilters } from '@/consts/hinatazakaFilters';
import type { Generation } from "@/consts/hinatazakaFilters";
import { GenerationMap } from "@/consts/hinatazakaFilters";
import { useFilterStore } from '@/stores/useFilterStore';
import { useSelectedMemberStore } from "@/stores/useSelectedMemberStore";
import { ActionIcon, Checkbox, Menu, Stack } from '@mantine/core';
import { IconFilter, IconFilterFilled } from '@tabler/icons-react';
import { useEffect, useState } from "react";

export function FilterButton() {
  const [isOpened, setIsOpened] = useState(false);

  // チェック状態をStateで管理
  const checkedFilters = useFilterStore((state) => state.checkedFilters);
  const setFilter = useFilterStore((state) => state.setFilter);

  // ✅ 初期化（マウント時にフィルター状態を設定）
  useEffect(() => {
    for (const filter of hinatazakaFilters) {
      useFilterStore.getState().setFilter(filter.type, filter.defaultChecked || false);
    }
  }, []);

  // ✅ チェックボックス変更時
  const handleCheckboxChange = (type: string, checked: boolean) => {
    setFilter(type, checked);
    console.log(`${type} is ${checked ? 'checked' : 'unchecked'}`);
  };


  // ✅ checkedFilters → Generation[] に変換してzustandに反映
  useEffect(() => {
    const selectedLabels = Object.entries(checkedFilters)
      .filter(([, checked]) => checked)
      .map(([label]) => label);


    const selectedGenerations: Generation[] = []
    let graduatedFilter = false

    for (const label of selectedLabels) {
      const mapped = GenerationMap[label]
      if (!mapped) continue

      if (mapped === 'graduated') {
        graduatedFilter = true
      } else {
        selectedGenerations.push(mapped)
      }
    }

    const filterObj: {
      gen?: Generation[];
      graduated?: boolean;
    } = {}

    if (selectedGenerations.length > 0) {
      filterObj.gen = selectedGenerations
    }

    filterObj.graduated = graduatedFilter

    useSelectedMemberStore.getState().setFilters(filterObj)
  }, [checkedFilters])



  return (
    <Menu
      opened={isOpened}
      onChange={setIsOpened}
      closeOnClickOutside={true}
      closeOnItemClick={false}
    >
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
