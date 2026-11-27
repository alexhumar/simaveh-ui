import { AppShell, Burger, Group, NavLink, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavLink as RouterNavLink, Outlet } from 'react-router-dom';
import { useGetVersion } from '../api/generated/endpoints/version/version';

/** Entradas del menu. Se agregan a medida que se implementa cada feature. */
const NAV_ITEMS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/marcas', label: 'Marcas', end: false },
];

export function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const { data: version } = useGetVersion();

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Abrir menu" />
            <Title order={3}>SiMaVeh</Title>
          </Group>
          <Text size="xs" c="dimmed">
            UI v{__APP_VERSION__}
            {version && ` · API v${version.version}`}
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        {NAV_ITEMS.map((item) => (
          <RouterNavLink key={item.to} to={item.to} end={item.end} onClick={close}>
            {({ isActive }) => <NavLink component="span" label={item.label} active={isActive} />}
          </RouterNavLink>
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
