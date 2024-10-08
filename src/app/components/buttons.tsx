"use client"
import Image from 'next/image'

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

export function ButtonWithImg({onClick, alt, image, title} : { onClick: () => void, alt : string, image : string, title : string}) {
    return (
        <div className='w-fit h-full'>
            <button className='btn-primary2' onClick={onClick}>
                <Image src={image} alt={alt} title={title} height={25} width={25} className='h-6 w-6'/>
            </button>
        </div>
    )
}

export function ButtonWithText({ text, type, handle} : { text : string, type : string, handle : () => void }) {
    let btn = `btn-primary`;
    if (type == "destructive")  {
        btn = "btn-destructive";
    }
    return (
        <button className={`${btn} h-fit flex flex-col`} onClick={handle}>{text}</button>
    )
}

type ButtonSideTextProps = {
    text : string, 
    image : string, 
    onClick : () => void, 
    lightness : Lighteness, 
    padding? : number,
    big? : boolean
}

export function ButtonSideText({ text, image, onClick, lightness, padding, big } : ButtonSideTextProps) {
    let bgColor = lightness == Lighteness.Dark ? "bg-neutral-200" : "bg-neutral-100";
    return (
        <button onClick={onClick} className='flex items-center gap-2'>
            <Image src={image} alt={text} width={10} height={10} className={`${big ? "w-8 h-8" : "w-7 h-7"} ${padding && `p-${padding}`} rounded text-neutral-900 ${bgColor} cursor-pointer hover:bg-violet-600 hover:bg-opacity-60 border hover:border-violet-600`}></Image>
            <p className={`text-neutral-600 text ${!big && "text-sm"}`}>{text}</p>
        </button>
    )
}

export type ButtonItems = {
    name: string,
    onClick: () => void;
    type: string;
}

export function ButtonList({ items } : { items : ButtonItems[]}) {
    return (
        <ul className='flex gap-2'>
            {
                items.map((item, index) => (
                    <ButtonWithText key={index} text={item.name} handle={item.onClick} type={item.type}/>
                ))
            }
        </ul>
    )
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
            hoverColor = "hover:outline-red-600 hover:bg-red-600";
            break;
        case (ButtonType.Creative):
            hoverColor = "hover:outline-green-600 hover:bg-green-600";
            break;
        case (ButtonType.MidDestructive):
            hoverColor = "hover:outline-yellow-600 hover:bg-yellow-600";
            break;
        default:
            hoverColor = "hover:outline-violet-600 hover:bg-violet-600";
            break;
    }
    return (
        <button  className={`rounded ${bgColor} hover:outline hover:outline-1 ${hoverColor}  w-fit h-fit  hover:bg-opacity-40`} onClick={button.onClick}>
            <img src={button.img} title={button.title} className={`w-${button.size} h-${button.size} p-${button.padding ?? "0"}`}></img>
        </button>
    )
}


/*
export function CreateButton({ text, onClick } : { text : string, onClick : () => void }) {
    return ( 
        <button onClick={onClick} className="flex gap-2 items-center mb-2 text-neutral-600 cursor-pointer">
            <img src="/plus.svg" className="w-8 h-8 bg-neutral-200 rounded  hover:outline hover:outline-1 hover:outline-violet-600 hover:bg-violet-600 hover:bg-opacity-40"/>
            <div>{text}</div>
        </button>
    )
}*/