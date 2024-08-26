import { signinInput, signupInput } from "@amolak/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    FRONTEND_URL: string;
  };
}>();
userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const { success } = signupInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({
      message: "Inputs are invalid",
    });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: body.password,
        name: body.name,
      },
    });

    const payload = { id: user.id };

    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);

    const jwt = await sign(payload, c.env.JWT_SECRET);
    setCookie(c, "token", jwt, {
      secure: true,
      httpOnly: true,
      sameSite: "None",
      expires: expires,
    });

    return c.json({ msg: "You are Signed up " });
  } catch (e) {
    const error = e as { code?: string };
    if (error.code === "P2002") {
      c.status(409);
      return c.json({ msg: "Username already exists" });
    }
    c.status(500);
    return c.json({
      message: "Internal Server error",
    });
  }
});

userRouter.post("/signin", async (c) => {
  const body = await c.req.json();
  const { success } = signinInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({
      message: "inputs are invalid",
    });
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: body.username,
        password: body.password,
      },
    });
    if (!user) {
      c.status(403);
      return c.text("invalid username");
    }
    const payload = { id: user.id };
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);

    const jwt = await sign(payload, c.env.JWT_SECRET);
    setCookie(c, "token", jwt, {
      httpOnly: true,
      secure: true,
      expires: expires,
      sameSite: "None",
    });

    return c.json({ msg: "You are logged in " });
  } catch (e) {
    c.status(411);
    return c.text("Invalid Inputs");
  }
});
