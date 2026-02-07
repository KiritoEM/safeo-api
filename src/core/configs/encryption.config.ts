import { registerAs } from '@nestjs/config';

export default registerAs('encryption', () => ({
    keyMaster: process.env.KEY_MASTER,
}));
