import type {CSSProperties} from "vue";

const themeSwitchStyle= (info: { focused: boolean, checked: boolean }) => {
    const style: CSSProperties = {}
    if (info.checked) {
        style.background = '#064141'
    } else {
        style.background = '#ff9100'
    }
    return style
}
export default themeSwitchStyle
