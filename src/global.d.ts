declare global {
    interface Window {
        api: {
            onURLReceived: (callback: any) => void,
            startChecking: () => void,
            stopChecking: () => void,
            saveFromHTTPS: (url: string) => Promise<string>,
            saveFromBuffer: (buffer: ArrayBuffer, fileName: string) => Promise<string>,
            removeFile: (path: string) => void
        }
    }
}

export {}