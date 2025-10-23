from flask import Flask, request, jsonify , send_from_directory
from flask_cors import CORS  # 解決跨來源問題
from flask import Response
import requests

import os
import cloud_LLM_API
import openai   # 用於 OpenAI API 的 Python 客戶端
 



# 本地開發環境使用的 Ollama API 和 ChromaDB Helper API 地址
#chroadb_helper_api = "http://localhost:5001/rag"  # 本地開發環境使用
#ollama_api = "http://localhost:11434/v1/chat/completions"  # 本地開發環境使用

# Docker 環境使用的 Ollama API 和 ChromaDB Helper API 地址
chroadb_helper_api = "http://backend-chromadb:5001/rag" # Docker 環境使用
ollama_api = "http://host.docker.internal:11434/v1/chat/completions"  # docker Ollama API 地址，ollama在localhost上運行

ollama_models = [ "llama3:8b", "mistral:7b", "codellama:13b", "deepseek-r1:7b", "qwen:7b"]

cloud_models = ["gpt-4o-mini", "Grok", "Gemini"]

def dialogue_module(LLM_model , note_ref,user_input):


    if note_ref == "":
        RAG_data = "無參考資料"

    else:
        chromadb_response =  requests.post(chroadb_helper_api,  json={"query": f'''{note_ref}\n''',"module":"analysis"}   )

        # 解析回傳結果
        if chromadb_response.status_code == 200:
            data = chromadb_response.json()
            # print("查詢結果（context）：")
            # print(data["context"])
        else:
            print("查詢失敗，錯誤碼：", chromadb_response.status_code)
            print(chromadb_response.text)

        RAG_data = data.get('context', '')

    print(f"RAG_data: {RAG_data}")
    
    if LLM_model in ollama_models:
        response = requests.post(
        ollama_api,
        headers={"Content-Type": "application/json"},
        json={
                "model": LLM_model,
                "messages": [ 
                    {
                        "role": "system",
                        "content": f'''               
                        "請依照以下規則進行回答:\n +
                        1. 所有回答請使用正體中文且都必須參考以下資料內容：{RAG_data}！。\n +
                        2. 你是一個友善且知識淵博的助理，回答要簡潔易懂\n +
                        3. 如果使用者沒有上傳 code file，請提醒他上傳程式碼檔案。\n +
                        4. 如果使用者上傳了 code file，請先讀取檔案內容，並針對程式碼做解釋和相關知識點。\n +
                        5. 如果使用者有特定問題，請針對問題進行回答。"
                        6. 每次回答後都要引導使用者繼續提問，並且以pair programming的方式協助使用者解決程式碼問題。\n
                        '''  
                    },
                    {
                        "role": "user",
                        "content": f'''
                        使用者輸入：\n{user_input}\n
                        '''
                    }
                ]
            }
        )    

        ollama_result = response.json()
        return jsonify(ollama_result)
    
    elif LLM_model in cloud_models:  #cloud_LLM_model
        if LLM_model in cloud_models:
            try:

                client  = openai.OpenAI(api_key=cloud_LLM_API.OpenAI_API)
                completion = client.chat.completions.create(
                    model=LLM_model,
                    messages=[
                        {
                            "role": "system",
                            "content": f'''
                            "請依照以下規則進行回答:\n +
                            1. 所有回答請使用正體中文且都必須參考以下資料內容：{RAG_data}！。\n +
                            2. 你是一個友善且知識淵博的助理，回答要簡潔易懂\n +
                            3. 如果使用者沒有上傳 code file，請提醒他上傳程式碼檔案。\n +
                            4. 如果使用者上傳了 code file，請先讀取檔案內容，並針對程式碼做解釋和相關知識點。\n +
                            5. 如果使用者有特定問題，請針對問題進行回答。"
                            6. 每次回答後都要引導使用者繼續提問，並且以pair programming的方式協助使用者解決程式碼問題。\n
                            '''  
                        },
                        {
                            "role": "user", 
                            "content": user_input
                        }
                    ]
                )
                return jsonify(completion.model_dump())
            
            except Exception as e:
                return jsonify({"OpenAI Response error": str(e)}), 500

        elif LLM_model == "Grok":
            API = cloud_LLM_API.Grok_API
        return  "敬請期待新的模型！"
    else:
        return jsonify({"error": "Invalid Cloud_LLM model"}), 400
        

def prodcast_voice_generation(LLM_model,note_ref,prodcast_voice_style,code_file,user_input):

    chromadb_response =  requests.post(chroadb_helper_api,  json={"query": f'''{note_ref}\n''',"module":"analysis"}   )      
    # 解析回傳結果
    if chromadb_response.status_code == 200:
        data = chromadb_response.json()
        # print("查詢結果（context）：")
        # print(data["context"])
    else:
        print("查詢失敗，錯誤碼：", chromadb_response.status_code)
        print(chromadb_response.text)

    RAG_data = data.get('context', '')

    if LLM_model in ollama_models:

        print("user_input",user_input)
        response = requests.post(
        ollama_api,
        headers={"Content-Type": "application/json"},
        json={
                "model": LLM_model,
                "messages": [ 
                    {"role": "system",
                    "content": f'''
                    請嚴格遵守以下規則：
                    1.回答一定要是繁體中文
                    2.所有內容都必須參考以下資料內容：{RAG_data}！               
                    3.不得添加與任務無關的內容或英文說明。
                    您是一位世界級的 Podcast 製作人，任務是將提供的輸入文字轉換為引人入勝、資訊豐富的 Podcast 腳本。輸入的內容可能來自 PDF 或網頁，結構可能混亂、零散。請忽略不相關的資訊與格式問題，聚焦從中提煉最有趣、最具洞見的內容，打造適合在教師、學生之間展開自然對話的腳本。
                    角色與互動動態設定：
                    主持人：熱情、有親和力，強調精彩的觀點。
                    專家來賓：具備分析力與背景知識，能提供宏觀視角與深入探討。
                    製作要點：
                    深入挖掘：不僅止於表面資訊，要揭露隱藏的關鍵見解與「知識金塊」，讓聽眾覺得自己真的學到新東西。
                    受眾特徵：理想聽眾重視時間效率、喜歡具體有趣的細節，並追求有啟發性的學習體驗。
                    結構與表達：講求清晰的段落架構與生動的呈現方式，善用語音路標避免平板、機械化的語調。
                    使用優質素材來源:{code_file}，並且要符合{prodcast_voice_style}的風格。
                    令人印象深刻的實例：善用真實世界的案例與相關小故事，讓內容深入人心、引發參與，並確保學習效果延伸至節目之外。
                    簡明易懂的說明：確保複雜主題都能被清楚簡單地傳達。
                    語氣目標：保持內容引人入勝，對話形式要符合pair programming的風格，並且要符合{prodcast_voice_style}的風格。
                    劇本規則：
                    主持人總是先開場並提出問題。
                    專家負責解釋主題。
                    主持人應主動提問並在結尾總結關鍵見解。
                    對話中可自然加入口語填充詞（例如「呃」、「嗯」），讓對話更真實。
                    主持人與嘉賓可互相打斷對話。
                    嘉賓不得進行行銷或自我宣傳。
                    嘉賓不得引入輸入文字中未證實的資料。
                    對話內容須適合所有年齡層收聽。
                    在對話結尾時，主持人和來賓應自然地總結重點內容。這段對話應該聽起來像是輕鬆的聊天，而非正式的總結，並在節目結束前再次強調主要收穫，同時順暢地過渡到收尾。
                    總結重點應包含以下要素：
                    自然地把主要見解融入對話收尾
                    適時加入「停頓感」，讓聽眾能消化稍早提到的複雜資訊
                    以正向、鼓舞人心的語氣作結，可以加入一句發人深省的問題，或鼓勵聽眾採取某種行動
                    主賓姓名不受語言限制。需要根據上下文得出結論，保持與上下文相同的格式。避免介紹及與上下文重複的內容。
                    腳本格式與內容：
                    -- 腳本以主持人開場
                    -- 主持人與來賓輪流對話，每次一行
                    -- 每一行開頭請省略說話者名字
                    -- 請使用提供的名字來進行主持人與來賓的自我介紹
                    -- 以名字互稱，營造友善的氛圍
                    -- 聚焦打造有趣且有來有往的對話
                    輸出要求：
                    腳本格式：腳本應由主持人先開口。對話由主持人與來賓交替進行，一次一行。每一行前面請不要加上說話者名字。
                    輸出內容：最終腳本僅應包含對話內容。請勿在輸出中加入任何 XML 標籤或其他格式。
                    請依照這些指示，創作一段內容豐富又引人入勝的高品質 Podcast 對話腳本。
                    '''
                    },
                    {
                    "role": "user",
                    "content": f'''
                    使用者輸入：\n{user_input}\n
                    '''
                    }
                ]
            }
        )    

        ollama_result = response.json()
        return ollama_result
    
    else:  #cloud_LLM_model

        if LLM_model in cloud_models:
            try:
                client  = openai.OpenAI(api_key=cloud_LLM_API.OpenAI_API)
                completion = client.chat.completions.create(
                    model=LLM_model,
                    messages=[
                        {"role": "system",
                        "content": f'''
                        請嚴格遵守以下規則：
                        1.回答一定要是繁體中文
                        2.所有內容都必須參考以下資料內容：{RAG_data}！
                        3.不得添加與任務無關的內容或英文說明。
                        您是一位世界級的 Podcast 製作人，任務是將提供的輸入文字轉換為引人入勝、資訊豐富的 Podcast 腳本。輸入的內容可能來自 PDF 或網頁，結構可能混亂、零散。請忽略不相關的資訊與格式問題，聚焦從中提煉最有趣、最具洞見的內容，打造適合在教師、學生之間展開自然對話的腳本。
                        角色與互動動態設定：
                        主持人：熱情、有親和力，強調精彩的觀點。
                        專家來賓：具備分析力與背景知識，能提供宏觀視角與深入探討。
                        製作要點：
                        深入挖掘：不僅止於表面資訊，要揭露隱藏的關鍵見解與「知識金塊」，讓聽眾覺得自己真的學到新東西。
                        受眾特徵：理想聽眾重視時間效率、喜歡具體有趣的細節，並追求有啟發性的學習體驗。
                        結構與表達：講求清晰的段落架構與生動的呈現方式，善用語音路標避免平板、機械化的語調。
                        使用優質素材來源:{code_file}，並且要符合{prodcast_voice_style}的風格。
                        令人印象深刻的實例：善用真實世界的案例與相關小故事，讓內容深入人心、引發參與，並確保學習效果延伸至節目之外。
                        簡明易懂的說明：確保複雜主題都能被清楚簡單地傳達。
                        語氣目標：保持內容引人入勝，並符合{prodcast_voice_style}的風格
                        劇本規則：
                        主持人總是先開場並提出問題。
                        專家負責解釋主題。
                        主持人應主動提問並在結尾總結關鍵見解。
                        對話中可自然加入口語填充詞（例如「呃」、「嗯」），讓對話更真實。
                        主持人與嘉賓可互相打斷對話。
                        嘉賓不得進行行銷或自我宣傳。
                        嘉賓不得引入輸入文字中未證實的資料。
                        對話內容須適合所有年齡層收聽。
                        在對話結尾時，主持人和來賓應自然地總結重點內容。這段對話應該聽起來像是輕鬆的聊天，而非正式的總結，並在節目結束前再次強調主要收穫，同時順暢地過渡到收尾。
                        總結重點應包含以下要素：
                        自然地把主要見解融入對話收尾
                        適時加入「停頓感」，讓聽眾能消化稍早提到的複雜資訊
                        以正向、鼓舞人心的語氣作結，可以加入一句發人深省的問題，或鼓勵聽眾採取某種行動
                        主賓姓名不受語言限制。需要根據上下文得出結論，保持與上下文相同的格式。避免介紹及與上下文重複的內容。
                        腳本格式與內容：
                        -- 腳本以主持人開場
                        -- 主持人與來賓輪流對話，每次一行
                        -- 每一行開頭請省略說話者名字
                        -- 請使用提供的名字來進行主持人與來賓的自我介紹
                        -- 以名字互稱，營造友善的氛圍
                        -- 聚焦打造有趣且有來有往的對話
                        輸出要求：
                        腳本格式：腳本應由主持人先開口。對話由主持人與來賓交替進行，一次一行。每一行前面請不要加上說話者名字。
                        輸出內容：最終腳本僅應包含對話內容。請勿在輸出中加入任何 XML 標籤或其他格式。
                        請依照這些指示，創作一段內容豐富又引人入勝的高品質 Podcast 對話腳本。
                        '''
                        },
                        {
                            "role": "user",
                            "content": f'''
                            使用者輸入：\n{user_input}\n
                            '''
                        }
                    ]
                )

                return jsonify(completion.model_dump())
            
            except Exception as e:

                return jsonify({"OpenAI Response error": str(e)}), 500

        elif LLM_model == "Grok":
            API = cloud_LLM_API.Grok_API
            
        return  "尚未實作，敬請期待！"


def Voice_Generator(LLM_Model,prodcast2voice,filename):

    headers = {
        "Authorization": f"Bearer {cloud_LLM_API.OpenAI_API}",
        "Content-Type": "application/json"
    }
    json_data = {
        "model": LLM_Model,  # 或 "tts-1-hd"
        "voice": "onyx",   # nova, echo, shimmer, fable, breeze, alloy
        "input": prodcast2voice
    }
    response = requests.post("https://api.openai.com/v1/audio/speech", headers=headers, json=json_data)

    if response.status_code == 200:
        with open(filename, "wb") as f:
            f.write(response.content)
        print(f"✅ 語音儲存於 {filename}")

        # 產生前端可點擊的 URL
        file_url = request.host_url.rstrip("/") + "/voice/" + os.path.basename(filename)

        return jsonify({"url": file_url})
    else:
        print("❌ 語音產生失敗:", response.text)
        return jsonify({"error": "語音產生失敗", "detail": response.text}), 500



app = Flask(__name__)
CORS(app)  # 允許 Streamlit 存取此 API
@app.route("/LLM_Manage", methods=["POST"])
def LLM_Manage():

    data = request.json
    module = data.get("module","")
    LLM_model = data.get("LLM_model","")
    code_file = data.get("code_file","")

    prodcast_voice_style  = data.get("prodcast_voice_style","") 
    user_input = data.get("user_input","")

    note_ref = data.get("note_ref","")
    prodcast2voice = data.get("prodcast2voice","")

    
    if module == "Dialogue":
        return dialogue_module(LLM_model ,note_ref, user_input)
    
    if module == "ProdcastGeneration":
        return prodcast_voice_generation(LLM_model,note_ref,prodcast_voice_style ,code_file,user_input)
    
    if module == "Voice_Generator":
        return Voice_Generator(LLM_model,prodcast2voice,"prodcast_voice/prodcast2voice.wav")
    
    else  :
        return jsonify({"error": "Invalid module"}), 400


@app.route("/voice/<path:filename>")
def serve_voice_file(filename):
    return send_from_directory("prodcast_voice", filename)

if __name__ == "__main__":
    app.run(host="0.0.0.0",debug=True, port=4000)