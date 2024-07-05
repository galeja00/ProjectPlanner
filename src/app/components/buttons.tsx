"use client"

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
        <button  className={`rounded ${bgColor} hover:outline hover:outline-1 hover:outline-${hoverColor} hover:bg-${hoverColor} p-${button.padding ?? "0"} hover:bg-opacity-40`} onClick={button.onClick}>
            <img src={button.img} title={button.title} className={`w-${button.size} h-${button.size}`}></img>
        </button>
    )
}


export function CreateButton({ text, onClick } : { text : string, onClick : () => void }) {
    return ( 
        <button onClick={onClick} className="flex gap-2 items-center mb-2 text-neutral-400 cursor-pointer">
            <img src="/plus.svg" className="w-8 h-8 bg-neutral-950 rounded  hover:outline hover:outline-1 hover:outline-violet-600"/>
            <div>{text}</div>
        </button>
    )
}