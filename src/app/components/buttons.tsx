"use client"

export enum ButtonType {
    Destructive,
    MidDestructive,
    Normal,
    Creative,
}

export enum Lighteness {
    Dark,
    Bright
}

export type Button = {
    onClick : () => void;
    img : string,
    type : ButtonType,
    size : number,
    padding?: number,
    lightness: Lighteness,
    title: string
}

export function ArrayButtons({ buttons, gap } : {  buttons : Button[], gap : number }) {
    return (
        <div className={`flex gap-${gap} h-full items-center`}>
            {
                buttons.map((button, index) => (
                    <ButtonComp key={index} button={button}/>
                ))
            }
        </div>
    )
}

function ButtonComp({ button } : { button : Button }) {
    let bgColor = button.lightness == Lighteness.Dark ? "bg-neutral-200" : "bg-neutral-50";
    
    let hoverColor;
    switch (button.type) {
        case (ButtonType.Destructive):
            hoverColor = "red-600";
            break;
        case (ButtonType.MidDestructive):
            // TOD: fix bug with color (orange-600)
            hoverColor = "violet-600";
            break;
        case (ButtonType.Creative):
            hoverColor = "green-600";
            break;
        default:
            hoverColor = "violet-600";
    }
    return (
        <button  className={`rounded ${bgColor} hover:outline hover:outline-1 hover:outline-${hoverColor} hover:bg-${hoverColor} w-fit h-fit  hover:bg-opacity-40`} onClick={button.onClick}>
            <img src={button.img} title={button.title} className={`w-${button.size} h-${button.size} p-${button.padding ?? "0"}`}></img>
        </button>
    )
}



export function CreateButton({ text, onClick } : { text : string, onClick : () => void }) {
    return ( 
        <button onClick={onClick} className="flex gap-2 items-center mb-2 text-neutral-400 cursor-pointer">
            <img src="/plus.svg" className="w-8 h-8 bg-neutral-200 rounded  hover:outline hover:outline-1 hover:outline-violet-600"/>
            <div>{text}</div>
        </button>
    )
}