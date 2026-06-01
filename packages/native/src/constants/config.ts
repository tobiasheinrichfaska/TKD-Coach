/**
 * DEV ONLY. When true, the app **wipes AsyncStorage and reseeds** on every start with the
 * full factory data + demo records (devSeed). This lets built-in/catalog edits show up
 * immediately during development (built-ins are otherwise seed-once).
 *
 * ⚠️ Set to false before shipping — true destroys the user's stored data on launch.
 */
export const DEV_RESEED = false;
