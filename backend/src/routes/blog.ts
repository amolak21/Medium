import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context, Hono } from "hono";
import { verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@amolak/medium-common";
import { getCookie } from "hono/cookie";

const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  const authHeader = getCookie(c, "token") || "";
  console.log(authHeader);

  try {
    const user = await verify(authHeader, c.env.JWT_SECRET);
    console.log(user);
    if (user) {
      c.set("userId", user.id as string);
      await next();
    }
  } catch (error) {
    c.status(403);
    return c.json({
      msg: "You are not logged in,Please log in to continue",
      error,
    });
  }
};

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    FRONTEND_URL: string;
  };
  Variables: {
    userId: string;
  };
}>();

//------------------------------------BLOG-POST----------------------------------

blogRouter.post("/", authMiddleware, async (c) => {
  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({
      message: "Inputs are invalid",
    });
  }

  const authorId = c.get("userId");

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: Number(authorId),
      },
    });
    return c.json({ id: blog.id });
  } catch (error) {
    console.error(error);
    return c.json("error in server , or maybe login again");
  }
});
//--------------------------------------------------BLOG-PUT----------------------------------
blogRouter.put("/", authMiddleware, async (c) => {
  const body = await c.req.json();
  const { success } = updateBlogInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({
      message: "inputs are invalid",
    });
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blog = await prisma.blog.update({
    where: {
      id: body.id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  return c.json({ id: blog.id });
});
//--------------------------------------------------BLOG-GET----------------------------------

blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blogs = await prisma.blog.findMany({
    select: {
      title: true,
      content: true,
      id: true,
      createdAt: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return c.json({
    blogs,
  });
});

//--------------------------------------------------BLOG-GET-ID-----------------------------------
blogRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const blog = await prisma.blog.findFirst({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return c.json({ blog });
  } catch (e) {
    console.log(e);
    return c.json({ msg: "error fetching" });
  }
});
