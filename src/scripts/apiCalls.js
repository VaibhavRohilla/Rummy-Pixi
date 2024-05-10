import 'regenerator-runtime/runtime'
import { APIURL, GlobalPlayerState } from './Globals';

const cashConverionAPIs = {
    // convertToGameBalance : "http://togamebalance.shubham7130.workers.dev/",
    convertToGameBalance : "https://togamebalance.gamesapp.co/",
    // convertToGameBalance : "https://togamebalance-prod.gamesapp.co/",
    // convertToCashBalance : "http://tocashbalance.shubham7130.workers.dev/"
    // convertToCashBalance : "https://tocashbalance-prod.gamesapp.co/"
    convertToCashBalance : "https://tocashbalance.gamesapp.co/",
    getPlayerWallet : "https://getplayerwallet.gamesapp.in/",
}

export async function GetPlayerWalletAPI(playerId) {
    console.log("GetPlayerWalletAPI")

    const url = cashConverionAPIs.getPlayerWallet;
    const options = {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            // "api-key" : "27a66aaf-df39-4cb3-a77a-1ce5647fdcd6"
        },
        body : JSON.stringify({
            playerId : playerId + ""
        })
    };

    try {
            
            const response = await fetch(url, options); 
            
            const data = await response.json();
            // console.log("GetPlayerWalletAPI", response, data)
    
            if(response.status === 200) {
                return {
                    success : true,
                    data : data.data
                }
            } else {
                return {
                    success : false,
                    message : data.data
                }
            }

    } catch (error) {
        return {
            success : false,
            message : "Error in getting player wallet"
        }
    }
}



export async function CheckPlayerStatusAPI(playerId) {
    console.log("CheckPlayerStatusAPI")

    const url = "http://64.227.142.49:9291/api/v1/"
    // const url = "http://139.59.86.126:9291/api/v1/"
    const options = {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            "api-key" : "27a66aaf-df39-4cb3-a77a-1ce5647fdcd6"
        },
        body : JSON.stringify({
            userId : playerId
        })
    };

    try {

        const response = await fetch(url + "user/details", options); 
        
        const data = await response.json();
        console.log("CheckPlayerStatusAPI", response, data)

        if(response.status === 200) {
            if(data.state === GlobalPlayerState['IN_LUDO']) {
                return {
                    success : true,
                    data : {
                        serverAddress : data.serverAddress,
                        tableType : data.tableType,
                        entryFee : data.entryFee
                    }
                }
            } else {
                return {
                    success : false,
                    message : "Player is not in Ludo"
                }
            }
        } else {
            return {
                success : false,
                message : 'Error in getting player status'
            }
        }


    } catch (error) {

        return {
            success : false,
            message : "Error in getting player status"
        }
    }

}


export async function getServerFromDistributor(connectionData) {

    console.log(JSON.stringify({
        "playerId": connectionData.playerId,
        "entryFee": connectionData.entryFee,
        "tableTypeId": connectionData.tableTypeID,
        "name": connectionData.pName,
    }));

    const options = {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify({
            "playerId": connectionData.playerId,
            "entryFee": connectionData.entryFee,
            "tableTypeId": connectionData.tableTypeID,
            "name": connectionData.pName,
        })
    };

    try {

        const response = await fetch(APIURL+ "gameServers", options); 

        const data = await response.json();
        if(response.status !== 200) {
            return {
                success : false,
                message : data.message
            }
        } 

        console.log(data.data)
        return {
            
            success : true,
            servers : data.data
        }

    } catch (error) {

        return {
            success : false,
            message : "Error in getting server from distributor"
        }
    }
}



export async function ConvertToGameBalance(playerId, entryFee) {

    const options = {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            // "api-key" : "cfec2599-d162-4c5a-893a-853712497b40"
        },
        body : JSON.stringify({
            playerId : playerId,
            amount : entryFee
        })
    };

    try {
        const response = await fetch(cashConverionAPIs.convertToGameBalance, options);
        console.log("convertToGameBalance",response)

        const data = await response.json();

        console.log(response.status, data)
        if(response.status !== 200) {
            return {
                success : false,
                message :  "Error \n"+ JSON.stringify(data)
            }
        } else {
            return {
                success : true,
                message : data.message
            }
        }

    } catch (error) {
        console.log(error)
        return {
            success : false,
            message : "Error in converting to game balance\n"
        }
    }

}

export async function ConvertToCashBalance(playerId , callback) {

    const options = {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            // "api-key" : "27a66aaf-df39-4cb3-a77a-1ce5647fdcd6"
        },
        body : JSON.stringify({
            playerId : playerId+"",
            from : {
                src : "gameClient"
            }
        })
    };

    try {
        const response = await fetch(cashConverionAPIs.convertToCashBalance, options);
        
        const data = await response.json();
        console.log("ConvertToCashBalance",response, data)

        if(response.status !== 200) {
            return {
                success : false,
                message : data.data ? data.data : "Error "+ JSON.stringify(data)
            }
        } else {
            return {
                success : true,
                message : data.message
            }
        }

    } catch (error) {
        console.log(error)
        return {
            success : false,
            message : "Error in converting to game balance\n"
        }
    }
}