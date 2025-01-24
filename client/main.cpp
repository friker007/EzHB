#include <iostream>
#include <curl/curl.h>
#include <string>
#include <json/json.h>
#include <thread>
#include <chrono>

// Callback for writing response data
size_t WriteCallback(char* ptr, size_t size, size_t nmemb, void* userdata) {
    std::string* response = static_cast<std::string*>(userdata);
    response->append(ptr, size * nmemb);
    return size * nmemb;
}

// Function to perform HTTP POST requests
std::string performPostRequest(const std::string& url, const std::string& jsonData) {
    CURL* curl = curl_easy_init();
    std::string response;

    if (curl) {
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonData.c_str());

        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);

        CURLcode res = curl_easy_perform(curl);
        if (res != CURLE_OK) {
            std::cerr << "cURL error: " << curl_easy_strerror(res) << std::endl;
        }

        curl_easy_cleanup(curl);
        curl_slist_free_all(headers);
    }
    return response;
}

// Function to send a heartbeat
void sendHeartbeat(const std::string& clientId, const std::string& status, const std::string& additionalInfo, int lol) {
    const std::string url = "http://localhost:3000/heartbeat";

    auto timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch())
        .count();

    Json::Value jsonData;
    jsonData["clientId"] = clientId;
    jsonData["timestamp"] = std::to_string(timestamp);
    jsonData["status"] = status;
    jsonData["additionalInfo"] = additionalInfo;
    jsonData["lol"] = lol;

    Json::StreamWriterBuilder writer;
    std::string jsonString = Json::writeString(writer, jsonData);

    std::string response = performPostRequest(url, jsonString);
    if (!response.empty()) {
        std::cout << "Server response: " << response << std::endl;
    }
}

int main() {
    const std::string clientId = "device1";
    const std::string status = "active";
    const std::string additionalInfo = "Operating system: Windows 10, CPU: Intel i7";

    while (true) {
        sendHeartbeat(clientId, status, additionalInfo, 1);
        std::this_thread::sleep_for(std::chrono::seconds(5));
    }

    return 0;
}
