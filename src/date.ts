export function convertDateToArray(date : Date) : number[] {
    // [day, mouth, fullyear]
    const result : number[] = new Array(3);
    result[0] = date.getDate();
    result[1] = date.getMonth();
    result[2] = date.getFullYear(); 
    return result;
} 

export function isEarlierDate(compDate : Date, date : Date) {
    const compArr : number[] = convertDateToArray(compDate);
    const dateArr : number[] = convertDateToArray(date);
    for (let i = 3; i >= 0; i--) {
        if (i == 0 && compArr[i] == dateArr[i]) return false;
        if (compArr[i] > dateArr[i]) return true;
        else if (compArr[i] < dateArr[i]) return false;
    }
    return true;
}

export function isLaterDate(compDate : Date, date : Date) {
    const compArr : number[] = convertDateToArray(compDate);
    const dateArr : number[] = convertDateToArray(date);
    for (let i = 3; i >= 0; i--) {
        if (i == 0 && compArr[i] == dateArr[i]) return false;
        if (compArr[i] < dateArr[i]) return true;
        else if (compArr[i] > dateArr[i]) return false;
    }
    return true;
}

export function isBetweenDates(start : Date, end : Date, between : Date) : boolean {
    return isEarlierDate(end, between) && isLaterDate(start, between);
}

export function getDiffInDays(start : Date, end : Date) : number {
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 ));
}


export function fromDayToMills(day : number) : number {
    return day * (1000 * 60 * 60 * 24);
}

export function formatDate(date : Date) : string {
    let formatedDate = "";
    const day = date.getDate();
    const month = date.getMonth() + 1; // Měsíce jsou indexovány od nuly, takže přidáme 1
    const year = date.getFullYear();
    formatedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
    return formatedDate;
}

