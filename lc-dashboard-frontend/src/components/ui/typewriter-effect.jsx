import React from "react";
import { motion } from "framer-motion";

export function TypewriterEffect({ words, className, cursorClassName }) {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [currentText, setCurrentText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const word = words[currentWordIndex]?.text || "";
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentText.length < word.length) {
            setCurrentText(word.slice(0, currentText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 1500);
          }
        } else {
          if (currentText.length > 0) {
            setCurrentText(word.slice(0, currentText.length - 1));
          } else {
            setIsDeleting(false);
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, words]);

  return (
    <div className={`flex items-center ${className || ""}`}>
      <span className="text-foreground">{currentText}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className={`inline-block w-[4px] h-8 bg-primary ml-1 ${cursorClassName || ""}`}
      />
    </div>
  );
}

export function TypewriterEffectSmooth({ words, className }) {
  return (
    <div className={`flex space-x-1 ${className || ""}`}>
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.1 }}
          className={word.className || ""}
        >
          {word.text}
          {idx < words.length - 1 && " "}
        </motion.span>
      ))}
    </div>
  );
}
