import { FastifyPluginAsync } from "fastify";
import { cloudLogin, loginDeviceByIp } from "tp-link-tapo-connect";

type IpParam = {
  ip: string;
}

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  if(!process.env.TAPO_USER || !process.env.TAPO_PWD) {
    throw new Error("Missing TAPO credentials");
  }

  fastify.get("/devices", async function (_request, _reply) {
    const cloudApi = await cloudLogin(
      process.env.TAPO_USER,
      process.env.TAPO_PWD,
    );

    const devices = await cloudApi.listDevicesByType("SMART.TAPOPLUG");
    console.log("🚀 ~ devices:", devices);
    return devices;
  });

  fastify.get<{Params: IpParam}>("/usage/:ip", {
    schema: {
      params: {
        type: "object",
        required: ["ip"],
        properties: {
          ip: { type: "string",  },
        }
      },
    },
  } ,async function (request, reply) {
    const ip = request.params.ip
    console.log("🚀 ~ constroot:FastifyPluginAsync= ~ ip:", ip)
    console.log("🚀 ~ constroot:FastifyPluginAsync= ~ process.env.TAPO_USER:", process.env.TAPO_USER)
    console.log("🚀 ~ constroot:FastifyPluginAsync= ~ process.env.TAPO_PWD!:", process.env.TAPO_PWD!)
    try {
      const device = await loginDeviceByIp(
        process.env.TAPO_USER!,
        process.env.TAPO_PWD!,
        ip
      );
      const usage = await device.getEnergyUsage();
      return { usage };
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  fastify.get<{Params: IpParam}>("/on/:ip", {
    schema: {
      params: {
        type: "object",
        required: ["ip"],
        properties: {
          ip: { type: "string",  },
        }
      },
  }},async function (request, reply) {
    const ip = request.params.ip;
    try {
      const device = await loginDeviceByIp(
        process.env.TAPO_USER!,
        process.env.TAPO_PWD!,
        ip
      );
      const usage = await device.getEnergyUsage();
      const info = await device.getDeviceInfo();
      await device.turnOn();
      return { info, status: 1, usage };
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

  fastify.get<{Params: IpParam}>("/off/:ip", {
    schema: {
      params: {
        type: "object",
        required: ["ip"],
        properties: {
          ip: { type: "string",  },
        }
      },
    },
  },async function (request, reply) {
    const ip = request.params.ip;
    try {
      const device = await loginDeviceByIp(
        process.env.TAPO_USER!,
        process.env.TAPO_PWD!,
        ip
      );
      const info = await device.getDeviceInfo();
      const usage = await device.getEnergyUsage();
      await device.turnOff();
      return { info, status: 0, usage };
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

export default root;
