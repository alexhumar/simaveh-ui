import { AppShell, Burger, Group, NavLink, ScrollArea, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useGetVersion } from '../api/generated/endpoints/version/version';
import { MENU } from '../entities/registry';
import { ColorSchemeToggle } from './ColorSchemeToggle';

export function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const { data: version } = useGetVersion();
  const { pathname } = useLocation();
  const section = pathname.split('/')[1] ?? '';

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 270, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Abrir menú" />
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Title order={3}>SiMaVeh</Title>
            </Link>
          </Group>
          <Group gap="sm">
            <Text size="xs" c="dimmed" visibleFrom="xs">
              UI v{__APP_VERSION__}
              {version && ` · API v${version.version}`}
            </Text>
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <AppShell.Section grow component={ScrollArea} p="xs">
          <NavLink component={Link} to="/" label="Inicio" active={section === ''} onClick={close} />
          {MENU.map(({ group, entities }) => (
            <NavLink
              key={group}
              label={group}
              fw={600}
              defaultOpened={entities.some((e) => e.slug === section)}
              childrenOffset="sm"
            >
              {entities.map((e) => (
                <NavLink
                  key={e.set}
                  component={Link}
                  to={`/${e.slug}`}
                  label={e.plural}
                  active={e.slug === section}
                  onClick={close}
                />
              ))}
            </NavLink>
          ))}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
