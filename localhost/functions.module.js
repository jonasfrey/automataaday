// here should be functions that really are only functions
// they take arguments do something and return something
// they should not depend on runtime data from the runtime scope
// for example
// do 
let f_n_sum = function(n_1, n_2){
    return n_1 + n_2
}
// don't 
let n_base = 10
let f_n_sum_dont = function(n_1){
    return n_base + n_1
}
let f_s_date = function(){
    const date = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);

    // Replace the month name with the format you need (first letter uppercase, rest lowercase)
    const finalDate = formattedDate.replace(/(\w+)\s(\d+)\s(\w+)\s(\d+)/, 
    (match, weekday, day, month, year) => 
    `${weekday} ${day}. ${month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()} ${year}`);

    console.log(finalDate);
    return finalDate
}
export {
    f_n_sum, 
    f_s_date
}