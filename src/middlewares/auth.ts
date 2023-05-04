import { NextFunction, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { decodeToken } from '../helpers/jwt'
import { RequestWithLoggedUser, LoggedUser } from '../entities/user.entity'

const prisma = new PrismaClient()

function authentication(req: RequestWithLoggedUser, res: Response, next: NextFunction) {
  if (req.headers.authorization) {
    // This auth receive `Bearer 1s0m3Tok3nH3re` as API token format
    const token = req.headers.authorization.split(' ')[1]
    req.loggedUser = decodeToken(token) as LoggedUser
    next()
  } else {
    res.status(400).json({ message: 'Invalid auth' })
  }
}

async function passwordAuthorization(
  req: RequestWithLoggedUser,
  res: Response,
  next: NextFunction
) {
  if (req.loggedUser) {
    const passID = req.params.id
    const user = req.loggedUser

    const findPass = await prisma.password.findUnique({
      where: {
        id: passID,
      },
    })

    const validUserTodo = user.id === findPass?.userId

    if (validUserTodo) {
      next()
    } else {
      res.status(403).json({ message: 'Forbidden access' })
    }
  } else {
    res.status(403).json({ message: 'Forbidden access' })
  }
}

export { authentication, passwordAuthorization }
