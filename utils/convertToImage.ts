// browserUtils.ts
import domtoimage, { type Options } from 'dom-to-image'
import { elementToSVG, inlineResources } from 'dom-to-svg'

export const IS_BROWSER = typeof window !== 'undefined'

export const copyImageToClipboard = async (
    element: HTMLElement,
    options: Options,
    borderRadius?: string
): Promise<void> => {
    if (!IS_BROWSER) {
        throw new Error('Clipboard operations are only supported in browser environments')
    }

    const formattedOptions = getFormattedOptions(element, options, borderRadius)
    
    console.debug('Converting to blob')
    domtoimage.toBlob(element, formattedOptions).then((blob: Blob) => {
        const item = new ClipboardItem({ [blob.type]: blob })
        navigator.clipboard.write([item]).then(
            () => {
                console.log('Blob copied to clipboard')
            },
            (error) => {
                console.error('Error copying blob to clipboard:', error)
            }
        )
    })
}

export const getPngElement = (element: HTMLElement, options: Options, borderRadius?: string): Promise<string> => {
    const formattedOptions = getFormattedOptions(element, options, borderRadius)
    return domtoimage.toPng(element, formattedOptions)
}

export const downloadPngElement = (
    element: HTMLElement,
    filename: string,
    options: Options,
    borderRadius?: string
): void => {
    getPngElement(element, options, borderRadius)
        .then((dataUrl: string) => {
            const link = document.createElement('a')
            link.href = dataUrl
            link.download = filename
            link.click()
        })
        .catch((error: Error) => {
            console.error('Error converting element to PNG:', error)
        })
}

export const getSvgString = async (
    element: HTMLElement,
    options: Options,
    borderRadius?: string
): Promise<string> => {
    const formattedOptions = getFormattedOptions(element, options, borderRadius)
    const svgDocument = elementToSVG(element)
    await inlineResources(svgDocument.documentElement)
    applySvgOptions(svgDocument, options)
    return new XMLSerializer().serializeToString(svgDocument)
}

export const getSvgElement = async (
    element: HTMLElement,
    options: Options,
    borderRadius?: string
): Promise<string> => {
    const svgString = await getSvgString(element, options, borderRadius)
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
}

export const downloadSvgElement = (
    element: HTMLElement,
    filename: string,
    options: Options,
    borderRadius?: string
): void => {
    getSvgElement(element, options, borderRadius)
        .then((dataUrl: string) => {
            const link = document.createElement('a')
            link.href = dataUrl
            link.download = filename
            link.click()
        })
        .catch((error: Error) => {
            console.error('Error converting element to SVG:', error)
        })
}

const defaultOptions: Options = {
    width: 400,
    height: 400
}

const getFormattedOptions = (
    element: HTMLElement,
    options: Options,
    borderRadius?: string
): Options => {
    if (options.width && options.height) {
        const scale = getResizeScaleToFit(element, options.width, options.height)
        return {
            style: { 
                scale, 
                transformOrigin: 'left top', 
                borderRadius: borderRadius ?? '48px' 
            },
            quality: 100,
            ...options
        }
    }
    return defaultOptions
}

const getResizeScaleToFit = (child: HTMLElement, width: number, height: number): number => {
    child.style.transformOrigin = 'center'
    const scaleX = width / child.offsetWidth
    const scaleY = height / child.offsetHeight
    const maxScale = Math.min(scaleX, scaleY)
    return maxScale
}

const applySvgOptions = (svgDocument: Document, options: Options) => {
    const svgElement = svgDocument.documentElement
    if (options.width) svgElement.setAttribute('width', options.width.toString())
    if (options.height) svgElement.setAttribute('height', options.height.toString())
    if (options.style) {
        for (const [key, value] of Object.entries(options.style)) {
            svgElement.style[key as any] = value as any
        }
    }
}


// export const IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED =
//   navigator.clipboard && navigator.clipboard.write != undefined
export const IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED =
  false