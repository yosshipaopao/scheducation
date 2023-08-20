# 作りたい機能って何だっけ？

* 時間割機能
    * クラス別に表示する done
    * 変則的な時間割に対応する done
    * 持ち物や課題などの制定 持ち物疑問課題無理
    * それの通知　no
* タスクリスト機能 done
    * 時間割との連携 no
    * 通知 no
    * タスクの優先度 no
    * タスクの期限 done
* GoogleClassroom連携機能 no gasでやる必要があるので厳しい
    * Apiを使ってGoogleClassroomの課題を取得する
    * それをタスクリストにchatGptのfunction Apiなどを使って追加する
    * その他重要なアナウンスを通知する
* その他
    * 思い出したら書く
    * なんかいいアイデアあったら教えて


# 技術面で作りたい機能って
* WebのSPA化して、PWA化する
* なるべくCloudFlareで運用する

# 必要な技術
* Webフロントエンド
    * Svelte
    * Flowbite-Svelte
    * PWA
    * ServiceWorker(通知)
* バックエンド
    * SvelteKit
    * AuthJs
    * drizzle-orm
    * CloudFlare Workers
    * CloudFlare KV
    * CloudFlare D1(予定)
    * ↑今はSupabaseを使っている　このままでもいいかも