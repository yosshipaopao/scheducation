# 作りたい機能って何だっけ？

* 時間割機能
    * クラス別に表示する
    * 変則的な時間割に対応する
    * 持ち物や課題などの制定
    * それの通知
* タスクリスト機能
    * 時間割との連携
    * 通知
    * タスクの優先度
    * タスクの期限
* GoogleClassroom連携機能
    * Apiを使ってGoogleClassroomの課題を取得する
    * それをタスクリストにchatGptのfunction Apiなどを使って追加する
    * その他重要なアナウンスを通知する
* 魔法のテスト機能
    * 魔法のアルゴリズムを使ってテストの出題を予測する
    * 魔法のアルゴリズムなんてないよ
    * かこｍ
* その他
    * 思い出したら書く
    * なんかいいアイデアあったら教えて


# 技術面で作りたい機能って
* WebのSPA化して、PWA化する
* なるべくCloudFlareで運用する
* tauriなどでスマホアプリ化する(必要性を感じない？)

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
    * ↑今はSupabaseを使っている