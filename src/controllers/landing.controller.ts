import { Request, Response } from 'express'

export function home(_req: Request, res: Response) {
  res.render('index', {
    title: 'Shaqty',
  })
}
