import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Hint } from "./hint";
import { Button } from "./ui/button";
import { CodeView } from "./code-view";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "./tree-view";
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";

type FileCollection = { [path: string]: string };

function getLanguageFromExtension(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension || "text";
}

interface FileBreadcrumbProps {
  path: string;
}

const FileBreadcrumb = ({ path }: FileBreadcrumbProps) => {
  const parts = path.split("/");
  const maxSegments = 4;

  const renderBreadcrumbItems = () => {
    if(parts.length <=maxSegments){
      return parts.map((segment, index) => {
        const isLast  = index === parts.length -1;

        return (
          <Fragment key={index}>
            <BreadcrumbItem>
              {isLast? (
                <BreadcrumbPage className="font-medium">
                  {segment}
                </BreadcrumbPage>
              ): (
                <span className="text-muted-foreground">
                  {segment}
                </span>
              )}
            </BreadcrumbItem>
            {!isLast  && <BreadcrumbSeparator/> }
          </Fragment>
        )
      })
    }
    
    else{
      const firstSegment = parts[0]
      const lastSegment = parts[parts.length-1]
    
      return (
        <>
          <BreadcrumbItem>
          <span className="text-muted-foreground">
            {firstSegment}

          </span>
          <BreadcrumbSeparator/>
          <BreadcrumbItem>
          <BreadcrumbEllipsis/>
          </BreadcrumbItem>
          <BreadcrumbSeparator/>
          </BreadcrumbItem>
          <BreadcrumbItem>
          <BreadcrumbPage className="font-medium">
          {lastSegment}
          </BreadcrumbPage>
          </BreadcrumbItem>
        </>
      )
    }
  }

  return (
    <Breadcrumb>
    <BreadcrumbList>
    {renderBreadcrumbItems()}
    </BreadcrumbList>
    </Breadcrumb>
  )
}

interface FileExplorerProps {
  files: FileCollection;
}

const WORKSPACE_ROOT = "/home/user";

export const FileExplorer = ({ files }: FileExplorerProps) => {
  /**
   * ✅ Normalize absolute paths → workspace-relative paths
   * "/home/user/app/page.tsx" → "app/page.tsx"
   */
  const normalizedFiles = useMemo(() => {
    const result: FileCollection = {};
    for (const [path, content] of Object.entries(files)) {
      const normalizedPath = path
        .replace(WORKSPACE_ROOT, "")
        .replace(/^\/+/, "");
      result[normalizedPath] = content;
    }
    return result;
  }, [files]);

  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    const keys = Object.keys(normalizedFiles);
    return keys.length ? keys[0] : null;
  });

  const [copied, setCopied] = useState(false)

  const treeData = useMemo(() => {
    return convertFilesToTreeItems(normalizedFiles);
  }, [normalizedFiles]);

  const handleFileSelect = useCallback(
    (filePath: string) => {
      if (normalizedFiles[filePath]) {
        setSelectedFile(filePath);
      }
    },
    [normalizedFiles]
  );



  const handleCopy = useCallback (()=>{
    if(selectedFile){
      navigator.clipboard.writeText(normalizedFiles[selectedFile])
      setCopied(true);
      setTimeout(() => {
        setCopied(false)
      }, 2000);
    }
  },[selectedFile,normalizedFiles])

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full min-h-0">
      <ResizablePanel
        defaultSize={30}
        minSize={30}
        className="bg-sidebar flex flex-col min-h-0"
      >
        <TreeView
          data={treeData}
          value={selectedFile}
          onSelect={handleFileSelect}
        />
      </ResizablePanel>

      <ResizableHandle className="hover:bg-primary transition-colors" />

      <ResizablePanel
        defaultSize={70}
        minSize={50}
        className="flex flex-col min-h-0"
      >
        {selectedFile && normalizedFiles[selectedFile] ? (
          <>
            <div className="border-b bg-sidebar px-4 py-2 flex items-center gap-x-2">
              <span className="truncate text-sm font-mono">
                {selectedFile}
              </span>
              <FileBreadcrumb
                path={selectedFile}
              />
              <Hint text="Copy to Clipboard" side="bottom">
                <Button variant="outline" size="icon" className="ml-auto" onClick={handleCopy} disabled={copied}>
                  {copied? <CopyCheckIcon/>: <CopyIcon className="size-4" />}
                </Button>
              </Hint>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              <CodeView
                code={normalizedFiles[selectedFile]}
                lang={getLanguageFromExtension(selectedFile)}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a file to view its contents.
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
