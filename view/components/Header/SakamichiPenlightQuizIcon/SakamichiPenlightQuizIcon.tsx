import { Text, Box } from '@mantine/core';
import { SakamichiLogo } from '../SakamichiLogo/SakamichiLogo';

import classes from './SakamichiPenlightQuizIcon.module.css';

export function SakamichiPenlightQuizIcon() {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <SakamichiLogo />
      <Text
        variant="gradient"
        gradient={{ from: 'violet', to: 'blue' }}
        className={classes.name}
        style={{ marginLeft: 0 }}
      >
        ペンライトクイズ
      </Text>
    </Box>
  );
}
