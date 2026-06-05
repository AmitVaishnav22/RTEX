export const QUEUES = {
    OTP_EMAIL_QUEUE:{
        OTP_EMAIL: "auth.otp.email.queue",
        OTP_EMAIL_RETRY: "auth.otp.email.retry.queue",
        OTP_EMAIL_DLQ: "auth.otp.email.dlq.queue"
    },
    SUBSCRIPTION_CONFIRMATION_QUEUE:{
        SUBSCRIPTION_CONFIRMATION: "subscription.confirmation.queue",
        SUBSCRIPTION_CONFIRMATION_RETRY:"subscription.confirmation.retry.queue",
        SUBSCRIPTION_CONFIRMATION_DLQ:"subscription.confirmation.dlq.queue"
    },
    WEEKLY_DIGEST_QUEUE:{
        WEEKLY_DIGEST: "weekly.digest.queue",
        WEEKLY_DIGEST_RETRY: "weekly.digest.retry.queue",
        WEEKLY_DIGEST_DLQ: "weekly.digest.dlq.queue"
    }
};

export const EXCHANGES = {
    AUTH: "auth.exchange",
    SUBSCRIPTION: "subscription.exchange",
    WEEKLY_DIGEST: "weekly.digest.exchange"
};

export const ROUTING_KEYS = {
    OTP_ROUTING_KEY:{
        OTP_EMAIL: "auth.otp.email",
        OTP_EMAIL_RETRY: "auth.otp.email.retry",
        OTP_EMAIL_DLQ: "auth.otp.email.dlq"
    },
    SUBSCRIPTION_ROUTING_KEY:{
        SUBSCRIPTION_CONFIRMATION: "subscription.confirmation",
        SUBSCRIPTION_CONFIRMATION_RETRY:"subscription.confirmation.retry",
        SUBSCRIPTION_CONFIRMATION_DLQ:"subscription.confirmation.dlq"
    },
    WEEKLY_DIGEST_ROUTING_KEY:{
        WEEKLY_DIGEST: "weekly.digest",
        WEEKLY_DIGEST_RETRY: "weekly.digest.retry",
        WEEKLY_DIGEST_DLQ: "weekly.digest.dlq"
    }
};