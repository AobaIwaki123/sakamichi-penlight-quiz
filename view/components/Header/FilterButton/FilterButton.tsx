"use client";

import { hinatazakaFilters, GenerationMap as HinatazakaGenerationMap } from '@/consts/hinatazakaFilters';
import { nogizakaFilters, GenerationMap as NogizakaGenerationMap } from '@/consts/nogizakaFilters';
import type { Generation } from "@/types/Member";
import { useFilterStore } from '@/stores/useFilterStore';
import { useSelectedMemberStore } from "@/stores/useSelectedMemberStore";
import { ActionIcon, Checkbox, Menu, Stack } from '@mantine/core';
import { IconFilter, IconFilterFilled } from '@tabler/icons-react';
import { useEffect, useState } from "react";

export function FilterButton() {
  const [isOpened, setIsOpened] = useState(false);

  // チェック状態aをStateで管理
  const checkedFilters = useFilterStore((state) => state.checkedFilters);
  const setFilter = useFilterStore((state) => state.setFilter);

  // 現在選択されているグループを取得
  const selectedGroup = useSelectedMemberStore((state) => state.selectedGroup);

  // グループに応じたフィルターとマッピングを選択
  const currentFilters = selectedGroup === 'nogizaka' ? nogizakaFilters : hinatazakaFilters;
  const currentGenerationMap = selectedGroup === 'nogizaka' ? NogizakaGenerationMap : HinatazakaGenerationMap;

  // ✅ 初期化（マウント時にフィルター状態を設定）
  useEffect(() => {
    // グループ変更時にフィルターをクリア
    useFilterStore.getState().clearFilters();

    // 新しいグループのフィルターを設定
    for (const filter of currentFilters) {
      useFilterStore.getState().setFilter(filter.type, filter.defaultChecked || false);
    }
  }, [selectedGroup, currentFilters]);

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
      const mapped = currentGenerationMap[label]
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
  }, [checkedFilters, currentGenerationMap])



  return (
    <Menu
      opened={isOpened}
      onChange={setIsOpened}
      closeOnClickOutside={false}
      closeOnItemClick={false}
    >
      <Menu.Target>
        <ActionIcon
          onClick={() => setIsOpened((prev) => !prev)}
          variant="light"
          size="xl"
        >
          {isOpened ? <IconFilterFilled stroke={1.5} /> : <IconFilter stroke={1.5} />}
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>フィルター</Menu.Label>
        <Menu.Item>
          <Stack>
            {currentFilters.map((filter) => (
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
