"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import * as React from "react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"


import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogHeader
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select"



type Message = {
  role: "user" | "ai" | "file" | "audio_script"
  content: string
  fileContent?: string
  fileUrl?: string
  audio_url?: string //未來語音播放用
}


const LLM_API_URL = "http://localhost:4000/LLM_Manage"; // LLM API 的 URL


async function readPdf(file: File): Promise<string> {  //尚未實作pdf讀取功能
  const { extractPdfText } = await import('@/lib/extractPdfText.client');
  return await extractPdfText(file);
}

// 頂部導覽列
export function head_block(username: string, modelNameMap: Record<string, string>, handleLogout: () => void, handleReset: () => void, prodcast_style: string, setProdcastStyle: React.Dispatch<React.SetStateAction<string>>, prodcast_style_Map: Record<string, string>, dialogmodelSelect: string, setDialogModelSelect: React.Dispatch<React.SetStateAction<string>>, PordcastVoiceModelSelect: string, setPordcastVoiceModelSelect: React.Dispatch<React.SetStateAction<string>>) {
  return (
    <div>
      <header className="flex items-center justify-between px-1 py-4 bg-white border-b shadow-sm">
        <h1 className="text-4xl font-bold text-blue-700">📘 CodeCast AI</h1>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="text-base text-gray-700 hover:bg-gray-400 bg-gray-200">
              👤 {username}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48">
            <div className="text-xl space-y-2 text-3xl">
              {/*
              <Dialog >
                <DialogTrigger asChild>
                  <button className="w-full text-left hover:text-blue-600">
                    帳號設定
                  </button>
                </DialogTrigger>

                { /*這是彈出來的懸浮視窗內容 }
                <DialogContent className="sm:max-w-md">
                  <DialogTitle>帳號設定</DialogTitle>
                  <DialogDescription>在這裡你可以微調帳號設定</DialogDescription>
                  "這個功能尚未實作，敬請期待！
                  <DialogClose asChild>
                    <Button className="mt-6 w-full">關閉</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
              */}
              <Dialog>
                {/* 用你的按鈕當觸發器 */}
                <DialogTrigger asChild>
                  <button className="w-full text-left hover:text-blue-600">
                    偏好設定
                  </button>
                </DialogTrigger>

                {/* 這是彈出來的懸浮視窗內容 */}
                <DialogContent className="sm:max-w-md">
                  <DialogTitle>偏好設定</DialogTitle>
                  <DialogDescription>在這裡你可以微調系統設定</DialogDescription>

                  {/* 模型選擇 Select */}
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium text-gray-700">選擇對話模型</label>
                    <Select
                      value={dialogmodelSelect}
                      onValueChange={(value_dialogmodelSelect) => {
                        setDialogModelSelect(value_dialogmodelSelect)
                        localStorage.setItem("model", value_dialogmodelSelect)
                        toast(`你選擇了對話模型：${modelNameMap[value_dialogmodelSelect] || value_dialogmodelSelect}`, {
                          position: "top-center",
                          duration: 2000,
                        })
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="請選擇模型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>📦 本地模型（Ollama）</SelectLabel>
                          <SelectItem value="llama3:8b">LLaMA 3</SelectItem>
                          <SelectItem value="deepseek-r1:7b">DeepSeek</SelectItem>
                          <SelectItem value="codellama:13b">CodeLLaMA</SelectItem>
                          <SelectItem value="qwen:7b">Qwen</SelectItem>
                          <SelectItem value="mistral:7b">Mistral</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>☁️ 雲端模型</SelectLabel>
                          <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 語音摘要模型選擇 Select */}
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium text-gray-700">選擇語音摘要製作模型</label>
                    <Select
                      value={PordcastVoiceModelSelect}
                      onValueChange={(value_voicemodelSelect) => {
                        setPordcastVoiceModelSelect(value_voicemodelSelect)
                        localStorage.setItem("model", value_voicemodelSelect)
                        toast(`你選擇了語音腳本模型：${modelNameMap[value_voicemodelSelect] || value_voicemodelSelect}`, {
                          position: "top-center",
                          duration: 2000,
                        })
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="請選擇模型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>📦 本地模型（Ollama）</SelectLabel>
                          <SelectItem value="llama3:8b">LLaMA 3</SelectItem>
                          <SelectItem value="deepseek-r1:7b">DeepSeek</SelectItem>
                          <SelectItem value="codellama:13b">CodeLLaMA</SelectItem>
                          <SelectItem value="qwen:7b">Qwen</SelectItem>
                          <SelectItem value="mistral:7b">Mistral</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>☁️ 雲端模型</SelectLabel>
                          <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 語音風格選擇 Select */}
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium text-gray-700">請選擇語氣風格</label>
                    <Select
                      value={prodcast_style}
                      onValueChange={(val_prodcastStyle) => {
                        setProdcastStyle(val_prodcastStyle)
                        localStorage.setItem("prodcast_style", val_prodcastStyle)
                        toast(`你選擇了語氣風格：${prodcast_style_Map[val_prodcastStyle] || val_prodcastStyle}`, {
                          position: "top-center",
                          duration: 2000,
                        })
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="請選擇語氣風格" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="語氣充滿活力與熱情，節奏稍快，聲調上揚，適合用於廣告、宣傳或需要激勵人心的內容。">活潑熱情</SelectItem>
                          <SelectItem value="語氣平靜、溫和，節奏放慢，聲音輕柔，非常適合用於冥想引導、睡前故事或需要讓人放鬆的場合。">平靜舒緩</SelectItem>
                          <SelectItem value="語氣沉穩、中立、吐字清晰，不帶過多情感，給人一種權威和可信賴的感覺，適合用於教學、新聞稿或正式報告。">專業清晰</SelectItem>
                          <SelectItem value="語氣溫柔、富有同理心，彷彿在安慰或表達關懷。節奏較慢，充滿了理解與支持的感覺，適合用於客服或健康相關的內容。">溫柔關懷</SelectItem>
                          <SelectItem value="如同在講一個引人入勝的故事，語氣富有表現力，音調有高低起伏，能吸引聽眾的注意力，適合用於有聲書、播客或歷史解說。">敘事沉浸</SelectItem>
                          <SelectItem value="語氣嚴肅、果斷且不容置疑，帶有命令感或警示意味。適合用於發布重要公告、安全須知或法律條文。">嚴肅權威</SelectItem>
                          <SelectItem value="語氣輕鬆、愉快，帶有一點趣味和幽默感，彷彿在微笑著說話。適合用於兒童內容、娛樂新聞或輕鬆的產品介紹。">俏皮愉快</SelectItem>
                          <SelectItem value="語氣自然、放鬆，就像在和朋友聊天一樣。可能會帶有一些自然的停頓和口語化的感覺，非常適合用於部落格文章或日常對話機器人。">日常對話</SelectItem>
                          <SelectItem value="語氣客觀、中立、發音標準，節奏穩定且流暢，如同專業的新聞主播。適合用於朗讀新聞報導或時事評論。">新聞播報</SelectItem>
                          <SelectItem value="語氣清晰、有條理，同時帶有耐心和鼓勵的感覺，像一位老師在逐步指導。適合用於線上課程、操作指南或教學影片。">教學引導</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogClose asChild>
                    <Button className="mt-6 w-full">關閉</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
              <button
                onClick={handleLogout}
                className="w-full text-left hover:text-blue-600"
              >
                登出
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </header>
    </div>
  )
}

// 參考資料區塊
export function note_block(fileList: FileSystemFileHandle[], selectedFiles: string[], toggleFileSelection: (fileName: string) => void, handleFolderPick: () => void, handleFileClick: (handle: FileSystemFileHandle) => void, activeFile: { name: string; content: string } | null, setActiveFile: React.Dispatch<React.SetStateAction<{ name: string; content: string } | null>>) {
  return (
    <div className="flex flex-col w-full h-full p-4 bg-gray-50 overflow-auto">
      <div className="flex text-2xl justify-between h-10">
        <h2 className="font-bold">📚 參考資料
        </h2>
        <button
          onClick={handleFolderPick}
          className="text-blue-600 hover:text-blue-800 font-bold pb-5"
        >
          ＋
        </button>
      </div>
      <hr />
      <ul className="space-y-2">
        {fileList.map((handle, idx) => (
          <li key={idx} className="flex items-center space-x-2">
            {/* ✅ Checkbox 控制勾選參考 */}
            <Checkbox
              className="border-black"
              id={`file-check-${idx}`}
              checked={selectedFiles.includes(handle.name)}
              onCheckedChange={() => toggleFileSelection(handle.name)}
            />

            {/* ✅ 檔名點擊後觸發預覽 */}
            <button
              onClick={() => handleFileClick(handle)}
              className="text-left hover:text-blue-600 truncate"
            >
              {handle.name.endsWith(".pdf") ? "📕" : "📄"} {handle.name}
            </button>
          </li>
        ))}
      </ul>

      {/* 懸浮視窗 Dialog */}
      <Dialog open={!!activeFile} onOpenChange={() => setActiveFile(null)}>
        <DialogContent className="w-[80vw] h-[80vh]  flex flex-col">
          <DialogHeader >
            <DialogTitle>{activeFile?.name}</DialogTitle>
          </DialogHeader>
          <hr />
          {activeFile?.content?.startsWith("pdf-preview:") ? (
            <iframe
              src={activeFile.content.replace("pdf-preview:", "")}
              className="w-full h-full border"
            />
          ) : (
            <div className="whitespace-pre-wrap text-base h-[90%] overflow-y-auto p-2  bg-gray-200">
              {activeFile?.content}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 聊天區塊
export function dialog_block(messages: Message[], scrollRef: React.RefObject<HTMLDivElement | null>, input: string, setInput: React.Dispatch<React.SetStateAction<string>>, codefileuploadlock: boolean, loading: boolean, triggerUpload: () => void, handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void, inputRef: React.RefObject<HTMLInputElement | null>, prodcast_generate_lock: boolean, handleReset: () => void, setMessages: React.Dispatch<React.SetStateAction<Message[]>>, dialogmodelSelect: string, prepareSelectedFileContent: () => Promise<string>, fileContent: string | null, setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
  //Dialog-Block 串接LLM API的函式 ，送出對話訊息並取得回應


  const handleSubmit = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault()
    if (!input.trim()) return alert("請輸入訊息後再送出！") // 如果沒有輸入內容，則提示使用者

    // latest user prompt
    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // 加入 AI 思考中訊息
    const loadingMessage = { role: "ai" as const, content: "AI 思考中..." }
    setMessages((prev) => [...prev, loadingMessage])

    // 準備 note_block勾選的NOTE內容
    const DilalogBlock_finalContent = await prepareSelectedFileContent();

    // system prompts
    const systemMessage = {
      role: "system",
      content:
        `code file data:\n${fileContent ?? "（使用者尚未上傳檔案）"}\n\n` +
        `使用者勾選的參考筆記資料:\n ${DilalogBlock_finalContent ?? "(使用者未勾選任何參考資料)"}\n\n`
    };



    //歷史聊天紀錄
    const updatedMessages = [
      systemMessage,          // 系統訊息一定放最前面
      ...messages,            // 歷史對話紀錄
      userMessage             // 最新使用者輸入
    ]

    setLoading(true) // 🔒 鎖住送出

    try {

      const userInputText = updatedMessages
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join("\n");

      const response = await fetch(LLM_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          module: "Dialogue",
          note_ref: DilalogBlock_finalContent,
          LLM_model: dialogmodelSelect,  // f確保有先用 `ollama run llama3:8b` 測試確定沒問題
          user_input: userInputText,
        }),
      })

      const data = await response.json()
      const LLM_reply = data?.choices?.[0]?.message?.content || "⚠️ 回應內容格式錯誤";


      if (data?.choices?.[0]?.message?.content) {
        // 把「AI 思考中」訊息移除，然後放 AI 回覆
        setMessages((prev) => {
          // 移除最後一筆 loading 訊息，再加入正式回覆
          const withoutLoading = prev.filter(msg => msg.content !== "AI 思考中...")
          return [...withoutLoading, { role: "ai", content: LLM_reply }]
        })
      } else {
        throw new Error("Ollama 回傳格式異常")
      }

    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "❌ 無法取得回應，請檢查 Ollama 是否有啟動" },
      ])
    } finally {
      setLoading(false) // 🔓 解鎖送出
    }
  }


  // 處理鍵盤事件，按下 Enter 鍵送出訊息
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }
  return (
    <div className="flex flex-col h-full w-full overflow-auto ">
      <div className="flex text-2xl justify-between h-14 items-center">
        <h2 className="font-bold text-2xl pl-2">對話</h2>
        <button
          type="button"
          className="font-bold text-2xl pr-2"
          onClick={handleReset}
        >
          🔄
        </button>
      </div>
      <hr />
      {/* 模型選擇區塊 */}
      {/* 聊天紀錄 ScrollArea */}
      <ScrollArea className="flex-1 border rounded-md p-4 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, idx) => {
            if (msg.role === "file") {
              return (
                <div key={idx} className="flex justify-end">
                  <div className="inline-block max-w-[80%] p-3 rounded-lg whitespace-pre-wrap break-words bg-blue-100 text-blue-900">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-blue-600 underline">
                          📄{msg.content}   {/*聊天區上傳檔案*/}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="w-[80vw] max-h-[80vh] overflow-auto ">
                        <DialogHeader >
                          <DialogTitle>{msg.content}</DialogTitle>
                        </DialogHeader>
                        <hr />
                        <DialogTitle className="sr-only">預覽文字檔案</DialogTitle>
                        {/* 用 <pre> 呈現文字內容（保留換行） */}
                        <pre className="whitespace-pre-wrap break-words text-sm p-4 rounded h-[60vh] overflow-auto  bg-gray-200">
                          {msg.fileContent}
                        </pre>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              );
            }
            // 一般訊息處理
            return (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`inline-block max-w-[80%] p-3 rounded-lg whitespace-pre-wrap break-words
            ${msg.role === "user" ? "bg-blue-100 text-blue-900" : "bg-gray-200 text-gray-900"}`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          {/* 滾動定位點放在這裡 */}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* 輸入欄區塊，改成固定最小高度 */}
      <div className="flex flex-col mt pb-15 relative">
        <form onSubmit={handleSubmit}>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="輸入訊息..."
            rows={3}
            className="text-xl leading-relaxed resize-none pr-20 py-3 min-h-[120px] max-h-[240px] w-full"
          />
        </form>

        {/* 下方操作按鈕列 */}
        <div className="flex justify-between items-center w-full px-2 text-xl absolute bottom-1 mb-2">
          {/* 左側：上傳 + 重置 */}
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileSelect}
            />

            <Button
              type="button"
              size="sm"
              className="transition-opacity duration-200 active:opacity-50"
              disabled={codefileuploadlock || loading}
              onClick={triggerUpload}
            >
              📄 上傳 Code File
            </Button>

          </div>
          {/* 右側：送出 */}
          <Button
            onClick={handleSubmit}
            type="submit"
            size="sm"
            className="transition-opacity duration-200 active:opacity-50"
            disabled={codefileuploadlock ? loading : (codefileuploadlock || loading)} // 🔒 如果有上傳檔案，只要根據loading狀態上鎖送出button；未上傳檔案則同時判斷2個Lock以免使用者同時進行"上傳檔案"及"送出對話"
          >
            送出
          </Button>
        </div>
      </div>
    </div>
  )
}

// 語音摘要區塊
export function voice_block(
  PordcastVoiceModelSelect: string,
  prodcast_style: string,
  prepareSelectedFileContent: () => Promise<string>,
  prodcast_generate_lock: boolean,
  setProdcastGenerateLock: React.Dispatch<React.SetStateAction<boolean>>,
  setscriptMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  scriptmessages: Message[],
  messages: Message[],
  handleVoiceSummaryReset: () => void,
  scrollvoiceRef: React.RefObject<HTMLDivElement | null>
) {
  // 1.處理語音腳本訊息 2.Prodcast SCRIPT TO voice(TTS)功能
  const handlevoiceSummary = async () => {

    setProdcastGenerateLock(true); // 鎖住產生按鈕，避免重複點擊

    const lastFile = [...messages].reverse().find(msg => msg.role === "file" && msg.fileContent);

    // 加入「產生中」的訊息
    setscriptMessages(prev => [...prev, { role: "ai", content: "🎙️ Prodcast 產生中..." }]);

    // 準備 note_block勾選的NOTE內容
    const VoiceBlock_finalContent = await prepareSelectedFileContent();


    if (!lastFile) {
      // 移除最後一筆 loading 訊息
      setscriptMessages(prev => prev.slice(0, -1));
      alert("找不到可用的檔案內容❗請先上傳 code file❗");
      setProdcastGenerateLock(false); // 解鎖產生按鈕
      return;
    }
    else {
      try {
        const script_response = await fetch(LLM_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            module: "ProdcastGeneration",
            LLM_model: PordcastVoiceModelSelect,
            note_ref: "VoiceBlock_finalContent",
            code_file: lastFile.fileContent, // 使用最後一個上傳的檔案內容
            prodcast_voice_style: prodcast_style,
            user_input: `請根據以下的 code file 和 教學風格 產生一段對話腳本或是教學。\n\n
                教學風格:${prodcast_style}\n\n
                參考資料區塊內容:\n${VoiceBlock_finalContent}\n\n
                歷史聊天訊息內容:\n${messages.map(msg => `${msg.role}: ${msg.content}`).join("\n")}\n\n
                Code file 如下：\n${lastFile.fileContent}`,
          }),
        });

        if (!script_response.ok) throw new Error("API 回傳錯誤");

        const data = await script_response.json();
        const LLM_prodcast_reply = data?.choices?.[0]?.message?.content || "⚠️ 回應內容格式錯誤";


        const scriptMessage: Message = {
          role: "ai",
          content: "Prodcast產生成功!\n---------------------------\n" + LLM_prodcast_reply + "\n---------------------------\n",
        };

        setscriptMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = scriptMessage;
          return updated;
        });


        //Prodcast script to voice(TTS)功能
        try {
          setscriptMessages(prev => [...prev, { role: "ai", content: "🎙️ Prodcast語音檔產生中..." }]);
          const voice_response = await fetch(LLM_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              module: "Voice_Generator",
              LLM_model: "tts-1", //openai-tts-1
              prodcast2voice: `${LLM_prodcast_reply}`,
            }),
          });

          if (!voice_response.ok) throw new Error("API 回傳錯誤");

          const prodcast2voice_data = await voice_response.json();
          const LLM_prodcast2voice_reply = prodcast2voice_data.url;


          const scriptMessage: Message = {
            role: "ai",
            content: "Prodcast語音檔產生成功!\n---------------------------\n" + LLM_prodcast2voice_reply + "\n---------------------------\n",
          };

          setscriptMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = scriptMessage;
            return updated;
          });
        }
        catch (err) {
          console.error("語音檔案產生錯誤：", err);
          setscriptMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "ai",
              content: "❌ 語音檔案產生失敗，請稍後再試。",
            };
            return updated;
          });
        }


      } catch (err) {
        console.error("產生語音腳本錯誤：", err);
        setscriptMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "ai",
            content: "❌ 產生失敗，請稍後再試。",
          };
          return updated;
        });
      }

      setProdcastGenerateLock(false); // 解鎖產生按鈕
    };
  }


  return (
    <div className="flex flex-col h-full w-full">
      {/* 標題列 */}
      <div className="flex flex-col w-full h-14 border-b shadow-sm px-4 pt-3 shrink-0">
        <div className="flex justify-between text-2xl font-bold pb-3">
          <div>📝 語音摘要</div>
          <button
            className="font-bold text-2xl pr-2"
            type="button" onClick={handleVoiceSummaryReset}>
            🔄
          </button>
        </div>
      </div>
      {/* Scroll 區域 */}

      <div className="flex-1 overflow-y-auto overflow-x-auto shirnk-0">
        <ScrollArea className="h-full border rounded-md p-4 overflow-y-auto overflow-x-auto shrink-0">
          <div className="space-y-6">
            {scriptmessages.map((msg, idx) => (
              <div
                key={idx}
                className={`w-full flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="bg-white text-gray-900 p-3 rounded-xl shadow-md">
                  {/* ✅ 改動處：支援訊息中出現網址時，自動轉成 <a> 超連結 */}
                  <pre className="whitespace-pre-wrap text-base">
                    {msg.content.split(/(http[s]?:\/\/\S+)/).map((part, i) =>
                      part.startsWith("http") ? (
                        <a
                          key={i}
                          href={part}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {part}
                        </a>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </pre>
                </div>
              </div>
            ))}
            <div ref={scrollvoiceRef} /> {/* 自動滾動用 */}
          </div>
        </ScrollArea>
      </div>

      <div className="p-3.5 shrink-0">
        <Button
          size="sm"
          className="transition-opacity duration-200 active:opacity-50  "
          disabled={prodcast_generate_lock}
          onClick={handlevoiceSummary}
        >
          生成語音摘要
        </Button>
      </div>
    </div>
  )
}

// 主頁面組件
export default function ChatPage() {

  const [dialogmodelSelect, setDialogModelSelect] = useState("llama3:8b") // 用來儲存選擇的對話模型
  const [PordcastVoiceModelSelect, setPordcastVoiceModelSelect] = useState("gpt-4o-mini") // 用來儲存選擇的語音腳本模型
  const [prodcast_style, setProdcastStyle] = useState("語氣清晰、有條理，同時帶有耐心和鼓勵的感覺，像一位老師在逐步指導。適合用於線上課程、操作指南或教學影片。")

  const modelNameMap: Record<string, string> = {
    "LLaMA 3": "llama3:8b",
    "DeepSeek": "deepseek-r1:7b",
    "Qwen": "qwen:7b",
    "Mistral": "mistral:7b",
    "CodeLLaMA": "codellama:13b",
    "Chatgpt": "gpt-4o-mini",
  }

  const prodcast_style_Map: Record<string, string> = {
    活潑熱情: "語氣充滿活力與熱情，節奏稍快，聲調上揚，適合用於廣告、宣傳或需要激勵人心的內容。",
    平靜舒緩: "語氣平靜、溫和，節奏放慢，聲音輕柔，非常適合用於冥想引導、睡前故事或需要讓人放鬆的場合。",
    專業清晰: "語氣沉穩、中立、吐字清晰，不帶過多情感，給人一種權威和可信賴的感覺，適合用於教學、新聞稿或正式報告。",
    溫柔關懷: "語氣溫柔、富有同理心，彷彿在安慰或表達關懷。節奏較慢，充滿了理解與支持的感覺，適合用於客服或健康相關的內容。",
    敘事沉浸: "如同在講一個引人入勝的故事，語氣富有表現力，音調有高低起伏，能吸引聽眾的注意力，適合用於有聲書、播客或歷史解說。",
    嚴肅權威: "語氣嚴肅、果斷且不容置疑，帶有命令感或警示意味。適合用於發布重要公告、安全須知或法律條文。",
    俏皮愉快: "語氣輕鬆、愉快，帶有一點趣味和幽默感，彷彿在微笑著說話。適合用於兒童內容、娛樂新聞或輕鬆的產品介紹。",
    日常對話: "語氣自然、放鬆，就像在和朋友聊天一樣。可能會帶有一些自然的停頓和口語化的感覺，非常適合用於部落格文章或日常對話機器人。",
    新聞播報: "語氣客觀、中立、發音標準，節奏穩定且流暢，如同專業的新聞主播。適合用於朗讀新聞報導或時事評論。",
    教學引導: "語氣清晰、有條理，同時帶有耐心和鼓勵的感覺，像一位老師在逐步指導。適合用於線上課程、操作指南或教學影片。"
  }

  // 聊天輸入欄狀態管理
  const [input, setInput] = useState("")

  // 初始訊息陣列，包含歡迎訊息
  const initialMessages: Message[] = [
    { role: "ai", content: "您好！歡迎使用 CodeCast AI！\n只要上傳您的程式碼檔案，我就能幫您解讀內容，並產出專屬的學習播客腳本，讓學習更輕鬆有趣。" }
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages)  // 聊天訊息陣列，初始值為歡迎訊息

  const scrollRef = useRef<HTMLDivElement>(null);  // 用來滾動到最新訊息的參考

  const router = useRouter()  // Next.js 的路由器，用來處理頁面跳轉

  const [username, setUsername] = useState("")  // 用來儲存登入的使用者名稱
  const [loading, setLoading] = useState(false) // 🔒 用來控制送出按鈕的狀態
  const [codefileuploadlock, setCodeFileUploadLock] = useState(false) // 🔒 用來控制檔案上傳按鈕的狀態
  const [prodcast_generate_lock, setProdcastGenerateLock] = useState(false) // 🔒 用來控制語音摘要按鈕的狀態

  // 用來儲存聊天區上傳code file的檔案內容，並用於製作prodcast 語音腳本
  const [scriptmessages, setscriptmessages] = useState<Message[]>([]);


  // 登出功能
  const handleLogout = () => {
    localStorage.removeItem("username")  // 清除登入資訊
    router.push("/login")                // 導回登入頁
  }


  //初次登入時透過 Toast 提示系統設定
  const hasShownToastRef = useRef(false);

  useEffect(() => {
    if (!hasShownToastRef.current) {
      hasShownToastRef.current = true;
      toast(
        <div>
          <p>系統目前設定如下：</p>
          <p>聊天模型：{dialogmodelSelect}</p>
          <p>語音模型：{PordcastVoiceModelSelect}</p>
          <p>語音風格：{prodcast_style}</p>
        </div>,
        {
          position: "top-center",
          duration: 2000, // 顯示時間為 2 秒
        }
      )
    }
  }, [])

  // 1. 檢查登入狀態，只需要在頁面載入時跑一次
  useEffect(() => {
    const storedName = localStorage.getItem("username")
    if (!storedName) {
      router.push("/login")
    } else {
      setUsername(storedName)
    }
  }, [router])



  // 2. 每次 messages 更新時就滾動到底
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const scrollvoiceRef = useRef<HTMLDivElement | null>(null);
  // 3. 每次 scriptMessages 更新時就滾動到底
  useEffect(() => {
    scrollvoiceRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [scriptmessages]);

  // 筆記摘要功能
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]); // 用來儲存選擇的檔案名稱
  function toggleFileSelection(fileName: string) {
    if (fileName.endsWith(".pdf")) {
      alert("目前不支援 PDF 檔案的摘要功能，請選擇其他檔案。");
      return;
    }
    setSelectedFiles((prev) =>
      prev.includes(fileName)
        ? prev.filter((f) => f !== fileName)
        : [...prev, fileName]
    );
  }

  //Note_Block 用來儲存選擇檔案的內容
  const [selectedFileContents, setSelectedFileContents] = useState<Record<string, string>>({}); // 用來儲存選擇檔案的內容
  async function prepareSelectedFileContent(): Promise<string> {
    if (selectedFiles.length === 0) {
      console.log("沒有選擇任何檔案");
      return "";
    }

    const missingFiles = selectedFiles.filter(
      (fileName) => !(fileName in selectedFileContents)
    );

    const newContents: Record<string, string> = {};

    for (const fileName of missingFiles) {
      const handle = fileList.find((f) => f.name === fileName);
      if (handle) {
        try {
          const file = await handle.getFile();
          if (fileName.endsWith(".pdf")) {

            if (typeof window !== "undefined" && fileName.endsWith(".pdf")) {
              try {

                const text = await readPdf(file);
                newContents[fileName] = text;
              } catch (error) {
                console.error(`讀取 ${fileName} 時發生錯誤`, error);
                newContents[fileName] = "❌ 無法解析 PDF 檔案";
              }
            }

          } else {
            const text = await file.text(); // 🔸 普通文字檔
            newContents[fileName] = text;
          }
        } catch (error) {
          console.error(`讀取 ${fileName} 時發生錯誤`, error);
        }
      }
    }

    setSelectedFileContents((prev) => ({
      ...prev,
      ...newContents,
    }));

    const finalContent = selectedFiles
      .map((fileName) => {
        const content = newContents[fileName] || selectedFileContents[fileName] || "";
        return `📄 ${fileName}\n${content}`;
      })
      .join("\n\n");

    /*   // 這段程式碼是用來顯示抓到的檔案內容，方便除錯
    try {
      alert(finalContent ? "有抓到檔案且內容如下\n" + finalContent : "沒有選擇任何檔案");
    }
    catch (error) {
      alert(finalContent ? "有抓到檔案但有異常" : "沒有選擇任何檔案");
    }
    */

    return finalContent;
  }


  // note_block 檔案列表和選擇的檔案
  const [fileList, setFileList] = useState<FileSystemFileHandle[]>([]);
  const [activeFile, setActiveFile] = useState<{ name: string; content: string } | null>(null);
  async function handleFolderPick() {
    if (!("showDirectoryPicker" in window)) {
      alert("請使用支援的瀏覽器（例如 Chrome,Edge）");
      return;
    }
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      const handles: FileSystemFileHandle[] = [];

      for await (const entry of dirHandle.values()) {
        if (entry.kind === "file") {
          handles.push(entry);
        }
      }
      setFileList(handles);
    } catch (err) {
      console.error("讀取資料夾錯誤", err);
    }
  }


  //聊天區上傳檔案
  async function handleFileClick(handle: FileSystemFileHandle) {
    const file = await handle.getFile();
    const name = file.name.toLowerCase();

    if (name.endsWith(".txt")) {
      const content = await file.text();
      setActiveFile({ name: file.name, content });
    } else if (name.endsWith(".pdf")) {
      const url = URL.createObjectURL(file);
      // 使用前綴標記為 iframe 顯示用途
      setActiveFile({ name: file.name, content: `pdf-preview:${url}` });
    } else {
      alert("目前僅支援 .txt 或 .pdf 檔案");
    }
  }

  const inputRef = useRef<HTMLInputElement>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = ""; // 清空 input 值，讓同一檔案能觸發 onChange

    const fileURL = URL.createObjectURL(file);
    const content = await file.text(); // ✅ 讀取檔案文字內容

    setFileUrl(fileURL);
    setFileName(file.name);
    setFileContent(content);

    setMessages((prev) => [  // ✅ 加入訊息陣列中，會出現在訊息欄
      ...prev,
      {
        role: "file",
        content: file.name,
        fileUrl: fileURL,
        fileContent: content,
      },
    ]);
    setCodeFileUploadLock(true) // 上傳後鎖住按鈕
  };

  const triggerUpload = () => {
    inputRef.current?.click()
  }

  //重置聊天介面
  const handleReset = () => {
    if (confirm("你確定要清除所有聊天紀錄嗎？這個動作無法復原。")) {
      setCodeFileUploadLock(false); // 解鎖上傳按鈕
      setLoading(false);  // 解鎖送出按鈕


      setMessages(initialMessages);   // 重置聊天訊息
      setFileUrl(null);   // 清除檔案 URL
      setFileName(null);  // 清除檔案名稱
      setFileContent(null);  // 清除檔案內容
      toast("已重置聊天紀錄", { position: "top-center" });
    }
  };

  // 語音摘要重置功能
  const handleVoiceSummaryReset = () => {
    if (confirm("你確定要清除所有腳本紀錄嗎？這個動作無法復原。")) {
      setscriptmessages([]); // 清空語音摘要訊息}
      toast("已清除語音摘要紀錄", { position: "top-center" });
    }
  }
  // 檢查是否有登入的使用者名稱
  if (!username) return null


  return (

    <div className="flex flex-col h-screen w-screen">
      {/* 頂部導覽列 */}
      <div>
        {head_block(username, modelNameMap, handleLogout, handleReset, prodcast_style, setProdcastStyle, prodcast_style_Map, dialogmodelSelect, setDialogModelSelect, PordcastVoiceModelSelect, setPordcastVoiceModelSelect)}      </div>
      {/* 主體區域 */}
      <main className="flex flex-1 overflow-hidden">
        {/* 左邊 - Ref */}
        <div className="flex-1 flex max-w-[20%]">
          {note_block(fileList, selectedFiles, toggleFileSelection, handleFolderPick, handleFileClick, activeFile, setActiveFile)}
        </div>

        {/* 中間 - 聊天區 */}
        <div className="flex-3 flex max-w-[60%]">
          {dialog_block(messages, scrollRef, input, setInput, codefileuploadlock, loading, triggerUpload, handleFileSelect, inputRef, prodcast_generate_lock, handleReset, setMessages, dialogmodelSelect, prepareSelectedFileContent, fileContent, setLoading)}
        </div>

        {/* 右邊 - 語音摘要 */}
        <div className="flex-3 flex max-w-[20%]">
          {voice_block(PordcastVoiceModelSelect,
            prodcast_style,
            prepareSelectedFileContent,
            prodcast_generate_lock,
            setProdcastGenerateLock,
            setscriptmessages,
            scriptmessages,
            messages,
            handleVoiceSummaryReset,
            scrollvoiceRef)}
        </div>
      </main>
    </div>
  )
}
