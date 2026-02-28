import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, RefreshCcwIcon, PlayIcon, Loader2Icon } from "lucide-react";
import { useState, useEffect } from "react";
import { Fragment } from "@/generated/prisma/client";
import { Hint } from "@/components/hint";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const [sandboxUrl, setSandboxUrl] = useState(normalizeUrl(data.sandboxUrl));

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  useEffect(() => {
    setSandboxUrl(normalizeUrl(data.sandboxUrl));
  }, [data.sandboxUrl]);

  const restoreMutation = useMutation(trpc.projects.restore.mutationOptions({
    onSuccess: (res) => {
      setSandboxUrl(normalizeUrl(res.sandboxUrl));
      setFragmentKey((prev) => prev + 1);
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  }));

  const handleStartSandbox = () => {
    restoreMutation.mutate({ fragmentId: data.id });
  };

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
        <Hint text="Run Sandbox" align="start" side="bottom">
            <Button
              size="sm"
              variant="outline"
              disabled={restoreMutation.isPending}
              onClick={handleStartSandbox}
            >
              {restoreMutation.isPending ? (
                <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <PlayIcon className="h-4 w-4 fill-green-500 text-green-500" />
              )}
            </Button>
        </Hint>
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