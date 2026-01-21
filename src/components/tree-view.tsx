import { TreeItem } from "@/types";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarProvider, SidebarRail } from "./ui/sidebar";
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";



interface TreeViewProps{
    data: TreeItem[];
    value: string|null;
    onSelect: (value:string)=>void;
} 

export const TreeView = ({data, value, onSelect}: TreeViewProps) =>{
    return (
        <SidebarProvider>
            <Sidebar collapsible="none" className="w-full">
                <SidebarContent> 
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {data.map((item, index)=>(
                                    <Tree key={index} item={item} selectedValue={value} onSelect={onSelect} parentPath="" />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail /> 
            </Sidebar>
        </SidebarProvider>
    )
}

interface TreeProps{
    item: TreeItem;
    selectedValue: string|null;
    onSelect: (value:string)=>void;
    parentPath: string;
}
const Tree = ({ item, selectedValue, onSelect, parentPath }: TreeProps) => {
    const [name, ...items] = Array.isArray(item) ? item : [item]
    const currentPath = parentPath ? `${parentPath}/${name}` : name
  
    // FILE
    if (!items.length) {
      const isSelected = currentPath === selectedValue
  
      return (
        <SidebarMenuButton
          isActive={isSelected}
          className="data-[active=true]:bg-transparent pl-8"
          onClick={() => onSelect(currentPath)}
        >
          <FileIcon className="w-4 h-4" />
          <span className="truncate">{name}</span>
        </SidebarMenuButton>
      )
    }
  
    // FOLDER
    return (
      <SidebarMenuItem>
        <Collapsible
          defaultOpen
          className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              <ChevronRightIcon className="transition-transform duration-200" />
              <FolderIcon className="w-4 h-4" />
              <span className="truncate">{name}</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
  
          <CollapsibleContent>
            <SidebarMenuSub className="ml-4">
              {items.map((child, index) => (
                <Tree
                  key={index}
                  item={child}
                  selectedValue={selectedValue}
                  onSelect={onSelect}
                  parentPath={currentPath}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    )
  }
  