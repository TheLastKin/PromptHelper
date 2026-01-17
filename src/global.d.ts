declare global {
    interface Window {
        api: {
            onURLReceived: (callback: any) => void,
            startChecking: () => void,
            stopChecking: () => void,
            saveFromHTTPS: (url: string, refID: number) => Promise<string>,
            saveFromBuffer: (buffer: ArrayBuffer, fileName: string, refID: number) => Promise<string>,
            removeFile: (path: string) => void,
            toggleWindowMode: () => void
        }
    }
}

export {}