import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";
import { useState } from "react";
import { Fragment } from "@/generated/prisma/client";
import { Hint } from "@/components/hint";

const normalizeUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};


interface Props {
    data: Fragment;
}
export const FragmentWeb = ({ data }: Props) => {
  const [fragmentKey, setFragmentKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const sandboxUrl = normalizeUrl(data.sandboxUrl);

  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };

  const handleCopy = () => {
    if (!sandboxUrl) return;
    navigator.clipboard.writeText(sandboxUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full h-full">
      
      <div className="flex items-center gap-2 p-2 border-b">
        <Hint text="Refresh" align="start" side="bottom">

            <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCcwIcon className="h-4 w-4" />
            </Button>
        </Hint>
        <Hint text ="URl of the Web site" side="bottom" align="center"> 
            <Button
            size="sm"
            disabled={!sandboxUrl || copied}
            className="flex-1 justify-start truncate font-normal"
            variant="outline"
            onClick={handleCopy}
            >
            {sandboxUrl}
            </Button>
        </Hint>
        <Hint text= "open in a new tab" side="bottom" align="start">

            <Button
            size="sm"
            disabled={!sandboxUrl}
            variant="outline"
            onClick={() => window.open(sandboxUrl, "_blank")}
            >
            <ExternalLinkIcon className="h-4 w-4" />
            </Button>
        </Hint>
      </div>
      <iframe
        key={fragmentKey}
        className="flex-1 w-full"
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={sandboxUrl}
      />
    </div>
  );
};