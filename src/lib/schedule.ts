const defaults=()=>{
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = (today.getMonth() + 1).toString();
    const date = today.getDate().toString();
    const mode = 'week';
    return {year,month,date,mode};
}

const check=(mode:string,year:string,month:string,date:string)=>{
    const today = defaults();
    let Mode=mode
    let Year=parseInt(year);
    let Month=parseInt(month);
    let IntDate=parseInt(date);
    // todo もう少しユーザーフレンドリーに
    if (!['month', 'week', 'date'].includes(mode)) Mode = 'week';
    if (Number.isNaN(Year) || Year < 2022 || Year > 2024) Year = parseInt(today.year);
    if (Number.isNaN(Month) || Month <= 0 || Month >= 13) Month = parseInt(today.month);
    if (Number.isNaN(IntDate) || IntDate <= 0 || IntDate > new Date(Year, Month, 0).getDate()) IntDate = parseInt(today.date);
    return {mode:Mode,year:Year,month:Month,date:IntDate};
}

const convertDate = (year:number,month:number,day:number)=>{
    let date = "";
    date += year.toString();
    if (month < 10) date += "0";
    date += month.toString();
    if (day < 10) date += "0";
    date += day.toString();
    return parseInt(date);
}

const restoreDate = (date:number)=>{
    const year = Math.floor(date / 10000);
    const month = Math.floor((date % 10000) / 100);
    const day = date % 100;
    return {year,month,date:day};
}

export default {defaults,check,convertDate,restoreDate};