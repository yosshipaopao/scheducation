export const date = (year:number,month:number,day:number)=>{
    let date = "";
    date += year.toString();
    if (month < 10) date += "0";
    date += month.toString();
    if (day < 10) date += "0";
    date += day.toString();
    return parseInt(date);
}