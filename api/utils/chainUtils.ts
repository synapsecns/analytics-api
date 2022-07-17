export function getChains() {
    return {
        "1": "ethereum",
        "10": "optimism",
        "25": "cronos",
        "56": "bsc",
        "137": "polygon",
        "250": "fantom",
        "288": "boba",
        "1088": "metis",
        "1284": "moonbeam",
        "1285": "moonriver",
        "8217": "klaytn",
        "42161": "arbitrum",
        "43114": "avalanche",
        "53935": "dfk",
        "121014925": "terra",
        "1313161554": "aurora",
        "1666600000": "harmony"
    }
}

export function getChainIdNums() {
    let res: number[] = []
    for (let key of Object.keys(getChains())) {
        res.push(parseInt(key))
    }
    return res
}

export function getChainIdStr() {
    return Object.keys(getChains())
}

export function getChainNames() {
    return Object.values(getChains())
}

export function getChainNameFromId(chainId: number|string) {
    let chainIdStr: string = chainId.toString()
    // @ts-ignore
    return getChains()[chainIdStr]
}

export function getChainIdNumFromName(chainName: string | any) {
    let chains = getChains()
    for (let key of Object.keys(chains)) {
        // @ts-ignore
        if (chains[key] === chainName) {
            return parseInt(key)
        }
    }
    return 0
}
