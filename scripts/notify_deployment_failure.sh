CURRENT_BRANCH=`git rev-parse --abbrev-ref HEAD`
STAGE="$1"
TEXT="Failed to deploy branch '$CURRENT_BRANCH' to '$STAGE' stage"
NOTIFICATION_URL="https://hooks.slack.com/services/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"

curl -X POST --data-urlencode "payload={\"text\": \"$TEXT\", \"username\": \"CircleCi\"}" $NOTIFICATION_URL
