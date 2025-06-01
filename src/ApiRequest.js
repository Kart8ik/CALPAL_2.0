const apiRequest = async (url='',options=null,errMsg="error has occured") => {
    try{
        const response = await fetch(url,options)
        if (!response.ok) {
            throw new Error(`Error in api call: ${response.status} ${response.statusText} ${response.message}`);
          }
        const data = await response.json()
        return data

    } catch(err){
        // Intentionally removed console.log(err || errMsg)
    } 
}

export default apiRequest;