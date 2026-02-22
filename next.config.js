/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
        config.resolve.fallback = {
            fs: false,
            net: false,
            tls: false,
            '@react-native-async-storage/async-storage': false
        };
        config.externals.push("pino-pretty", "lokijs", "encoding");

        // Ignore React Native specific modules in browser builds
        if (!isServer) {
            config.resolve.alias = {
                ...config.resolve.alias,
                '@react-native-async-storage/async-storage': false,
            };
        }

        return config;
    },
};

module.exports = nextConfig;
