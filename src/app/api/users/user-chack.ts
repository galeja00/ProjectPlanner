import { User } from "@prisma/client";
import { Session, getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { prisma } from "@/db";


