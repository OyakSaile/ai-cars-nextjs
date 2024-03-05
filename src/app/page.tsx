/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fileToBase64 } from "@/utils/convertFileToBase64";
import { fileToGenerativePart } from "@/utils/fileToGenerativePart";
import { ChangeEvent, useState } from "react";
const { GoogleGenerativeAI } = require("@google/generative-ai");

export default function Home() {
  const [file, setFile] = useState<File>();
  const [generatedText, setGeneratedText] = useState<string>("");
  const [carImage, setCarImage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  async function generateImage() {
    if (file) {
      setLoading(true);
      const testandoImagem = await fileToGenerativePart(file);
      const base64Image = await fileToBase64(file);

      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      const prompt =
        "Gostaria que você me falasse sobre esse carro, detalhes, marca, ano que foi lançado, e um pouco de sua história, separe em uma tabela o motor e as características do carro, detalhe o modelo do carro também, separe as tags em HTML, sem doctype etc, apenas as tags de conteúdo, separe as caracteristicas, caso não seja um carro retorne uma mensagem dizendo que não foi possível identificar o carro.";

      const result = await model.generateContent([prompt, testandoImagem]);
      const response = await result.response;
      const text = response.text();

      setGeneratedText(text);
      setLoading(false);
      setCarImage(base64Image as string);
    }
  }

  return (
    <main className="flex dark bg-primary-foreground lg:p-24 min-h-screen justify-start items-center flex-col lg:flex-row">
      <div className="gap-4 items-start grid grid-cols-1 lg:grid-cols-2 h-full w-full p-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Faça upload de uma imagem de carro</CardTitle>
            <CardDescription>
              deixe a i.a mostrar qual o modelo do carro e suas informações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div>
                <Label>Imagem</Label>
                <Input onChange={handleFileChange} type="file" />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              onClick={generateImage}
              variant="secondary"
              className="w-full"
              disabled={loading || !file}
            >
              {loading ? "Carregando..." : "Gerar"}
            </Button>
          </CardFooter>
        </Card>

        <div className="text-muted-foreground flex flex-col text-left gap-8">
          {carImage && (
            <img className="max-w-xs w-full h-full" src={carImage}></img>
          )}
          {generatedText && (
            <div
              className="flex flex-col gap-3"
              dangerouslySetInnerHTML={{ __html: generatedText }}
            ></div>
          )}
        </div>
      </div>
    </main>
  );
}
