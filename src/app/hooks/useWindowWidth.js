import { useEffect } from "react";

//Basically, It subscribes on the resize event and returns window.innerWidth every time the window resizes.

export default function useWindowWidth(initalWidth = 0) {
    const [windowWidth, setWindowWidth] = useState({
        width: process.browser ? window.innerWidth : initalWidth
    });

    useEffect(() => {
        function getSize() {
            return {
                width: process.browser ? window.innerWidth : initalWidth
            }
        }
        function handleResize() {
            setWindowWidth(getSize());
        }
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize)
        }

    }, [])
}
