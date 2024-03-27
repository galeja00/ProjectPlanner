export enum ButtonType {
    Destructive,
    MidDestructive,
    Normal,
    Creative,
}

export enum Lighteness {
    dark,
    bright
}

export type Button = {
    onClick : () => void;
    img : string,
    type : ButtonType,
    size : number,
    lightness: Lighteness,
    title: string
}

export function ArrayButtons({ buttons, gap } : {  buttons : Button[], gap : number }) {
    return (
        <div className={`flex gap-${gap}`}>
            {
                buttons.map((button) => (
                    <ButtonComp button={button}/>
                ))
            }
        </div>
    )
}

function ButtonComp({ button } : { button : Button }) {
    let bgColor = "bg-neutral-900";
    if (button.lightness == Lighteness.dark) {
        bgColor = "bg-neutral-900";
    }
    let hoverColor = "violet-600";
    switch (button.type) {
        case (ButtonType.Destructive):
            hoverColor = "red-600";
            break;
        case (ButtonType.MidDestructive):
            hoverColor = "orange-600";
            break;
        case (ButtonType.Creative):
            hoverColor = "green-600";
            break;
    }
    return (
        <button className={`rounded ${bgColor} hover:outline hover:outline-1 hover:outline-${hoverColor}`} onClick={button.onClick}>
            <img src={button.img} title={button.title} className={` hover:bg-${hoverColor} hover:bg-opacity-40 w-${button.size} h-${button.size}`}></img>
        </button>
    )
}
