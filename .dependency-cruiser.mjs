/** @type {import("dependency-cruiser").IConfiguration} */
const configuration = {
    forbidden: [
        {
            comment:
                "Circular imports make rule initialization order fragile and must be removed.",
            from: {},
            name: "no-circular",
            severity: "error",
            to: {
                circular: true,
            },
        },
    ],
    options: {
        doNotFollow: {
            path: "node_modules",
        },
        moduleSystems: [
            "cjs",
            "es6",
            "tsd",
        ],
        tsConfig: {
            fileName: "tsconfig.json",
        },
    },
};

export default configuration;
