'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { authUser, signOut } = useAuth()
  const router = useRouter()

  if (!authUser) {
    router.push('/')
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const brokerMenuItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
    },
    {
      title: 'Deals',
      href: '/deals',
      icon: '💼',
    },
    {
      title: 'Vendors',
      href: '/vendors',
      icon: '👥',
    },
    {
      title: 'Resources',
      href: '/resources',
      icon: '📚',
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: '📈',
    },
  ]

  const vendorMenuItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
    },
    {
      title: 'My Deals',
      href: '/deals',
      icon: '💼',
    },
    {
      title: 'New Application',
      href: '/application',
      icon: '📝',
    },
    {
      title: 'Resources',
      href: '/resources',
      icon: '📚',
    },
  ]

  const menuItems = authUser.userType === 'broker' ? brokerMenuItems : vendorMenuItems

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-lg font-semibold">
                Equipment Finance Portal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <a href={item.href} className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          {item.title}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {authUser.profile.company_name?.charAt(0) || 
                       (authUser.userType === 'vendor' && 
                        (authUser.profile as { first_name?: string }).first_name?.charAt(0)) || 
                       'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">
                      {authUser.userType === 'broker' 
                        ? authUser.profile.company_name 
                        : `${(authUser.profile as { first_name: string; last_name: string }).first_name} ${(authUser.profile as { first_name: string; last_name: string }).last_name}`}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {authUser.userType}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Profile Settings
                </DropdownMenuItem>
                {authUser.userType === 'broker' && (
                  <DropdownMenuItem>
                    Billing & Subscription
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background px-6 py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-semibold">
                {authUser.userType === 'broker' ? 'Broker Dashboard' : 'Vendor Dashboard'}
              </h1>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}