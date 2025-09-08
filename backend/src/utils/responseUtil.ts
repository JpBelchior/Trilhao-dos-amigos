import { Response } from "express";
import { IApiResponse } from "../types/models";

export class ResponseUtil {
  // Resposta de sucesso padrão
  public static sucesso(
    res: Response,
    dados?: any,
    mensagem?: string,
    status: number = 200
  ): void {
    const response: IApiResponse = {
      sucesso: true,
      dados,
      mensagem,
    };
    res.status(status).json(response);
  }

  // Resposta de erro de validação (400)
  public static erroValidacao(
    res: Response,
    erro: string,
    detalhes?: string
  ): void {
    const response: IApiResponse = {
      sucesso: false,
      erro,
      detalhes,
    };
    res.status(400).json(response);
  }

  // Resposta de não autorizado (401)
  public static naoAutorizado(
    res: Response,
    erro: string = "Não autorizado",
    detalhes?: string
  ): void {
    const response: IApiResponse = {
      sucesso: false,
      erro,
      detalhes,
    };
    res.status(401).json(response);
  }

  //Resposta de não encontrado (404)
  public static naoEncontrado(
    res: Response,
    erro: string = "Recurso não encontrado",
    detalhes?: string
  ): void {
    const response: IApiResponse = {
      sucesso: false,
      erro,
      detalhes,
    };
    res.status(404).json(response);
  }

  // Resposta de erro interno (500)
  public static erroInterno(
    res: Response,
    erro: string = "Erro interno do servidor",
    detalhes?: string
  ): void {
    const response: IApiResponse = {
      sucesso: false,
      erro,
      detalhes,
    };
    res.status(500).json(response);
  }

  // Resposta de criação bem-sucedida (201)
  public static criado(res: Response, dados?: any, mensagem?: string): void {
    this.sucesso(res, dados, mensagem, 201);
  }
}
