import os from 'os';

const getPublicIP = () => {

    const networkInterfaces = os.networkInterfaces();
    for (const netInterface in networkInterfaces) {

        const interfaceConfigs = networkInterfaces[netInterface];
        for (const config of interfaceConfigs) {

            const isLocalhost = config.address === '127.0.0.1';
            const isIPv4 = config.family.toLowerCase() === 'ipv4';
            const isInternalAddress = config.internal;

            if (!isLocalhost && isIPv4 && !isInternalAddress) {
                return config.address;
            }
        }
    }

    return '0.0.0.0';
}

export { getPublicIP };
