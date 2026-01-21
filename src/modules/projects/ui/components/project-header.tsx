import { DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, ChevronLeftIcon, EditIcon, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
    projectID: string;
}

export const ProjectHeader = ({projectID}: Props)=>{
    const trpc = useTRPC();
    const {data:project} = useSuspenseQuery(
        trpc.projects.getOne.queryOptions({id:projectID})
    ) 
    const { theme, setTheme } = useTheme();
    return (
        <header className="p-2 flex justify-between items-center border-b">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size= "sm"
                        className="focus-visible:ring-0 hove:bg-transparent hover:opacity-75
                        transition-opacity pl-2!">
                        <Image src= "/logo.svg" alt= "Vibe" width = {18} height={18}>
                        </Image>
                        <span className="text-sm font-medium">{project.name}</span>
                        <ChevronDownIcon/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="start">
                    <DropdownMenuItem asChild>
                        <Link href="/">
                            <ChevronLeftIcon/>
                            <span>Go to DashBoard</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2">
                            <SunMoonIcon className="size-4 text-muted-foreground "/>
                            <span>Appearance</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                                        <DropdownMenuRadioItem value="light">
                                            <span>Light</span>
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="dark">
                                            <span>Dark</span>
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="system">
                                            <span>System</span>
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSubTrigger>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}