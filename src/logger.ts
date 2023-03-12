import winston, {Logger} from "winston";

export function getLogger(): Logger {
    return winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize({
                all: true,
                colors: {
                    info: 'green',
                    error: 'red'
                }
            }),
            winston.format.printf(info => `${info.timestamp} ${info.message}`)
        ),
        transports: [
            new winston.transports.Console()
        ]
    });
}
